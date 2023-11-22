import {
  getConfigModule,
  getStormConfig
} from "@storm-software/config/get-config";
import { formatDateTime } from "@storm-software/date-time";
import { isStormError } from "@storm-software/errors";
import { isRuntimeServer } from "@storm-software/utilities/helper-fns/is-runtime-server";
import { titleCase } from "@storm-software/utilities/string-fns/title-case";
import { isSetString } from "@storm-software/utilities/type-checks/is-set-string";
import { tmpdir } from "os";
import { join } from "path";
import { DestinationStream, LoggerOptions as PinoLoggerOptions } from "pino";
import * as z from "zod";
import { LoggingConfigSchema } from "./schema";
import { createFileTransport } from "./transports/file-transport";

export type LoggerOptions = {
  options: PinoLoggerOptions;
  stream?: DestinationStream;
};

export type GetOptionsResult = {
  console: LoggerOptions;
  file?: LoggerOptions;
};

/**
 * Get the options for the logger
 *
 * @param projectName - The name of the project to get the options for
 * @returns The options for the logger
 */
export const getOptions = async (
  projectName?: string
): Promise<GetOptionsResult> => {
  const workspaceConfig = await getStormConfig();

  const loggingConfig =
    (await getConfigModule<z.infer<typeof LoggingConfigSchema>>(
      LoggingConfigSchema,
      "logging",
      projectName
    )) ?? {};
  if (!isSetString(loggingConfig.path)) {
    loggingConfig.path = join(tmpdir(), "storm", "logs");
  }

  loggingConfig.level ??=
    workspaceConfig?.environment === "production" ? "error" : "debug";
  loggingConfig.stacktrace ??=
    workspaceConfig?.environment === "production" ? false : true;

  const baseOptions: PinoLoggerOptions = {
    enabled: loggingConfig.level !== "silent",
    level: loggingConfig.level,
    messageKey: "msg",
    errorKey: "error",
    timestamp: () => formatDateTime(),
    formatters: {
      level: (label: string, number: number) => {
        const level = titleCase(label);

        return {
          label: level,
          level,
          levelLabel: level,
          number
        };
      },
      log: (object: Record<string, unknown>) =>
        isStormError(object.err)
          ? { ...object, error: object.err.print() }
          : isStormError(object.error)
            ? { ...object, error: object.error.print() }
            : isStormError(object.exception)
              ? { ...object, error: object.exception.print() }
              : object
    },
    browser: {
      disabled: loggingConfig.level === "silent"
    }
  };

  const consoleOptions: PinoLoggerOptions = {
    name: `${projectName} - Console`,
    ...baseOptions,
    msgPrefix: "⚡️",
    transport: {
      target: "pino-pretty",
      options: {
        destination: 1, // 1 = stdout
        colorize: true,
        colorizeObjects: true,
        errorLikeObjectKeys: ["err", "error", "exception"],
        minimumLevel: loggingConfig.level,
        messageKey: "msg",
        errorKey: "error",
        timestampKey: "time",
        msgPrefix: "⚡️",
        messageFormat:
          "[{time}] {levelLabel} ({if pid}{pid} - {end}{req.url}: {msg}",
        singleLine: false,
        hideObject: false
      }
    }
  };

  if (workspaceConfig) {
    consoleOptions.transport!.options!.customColors = {
      exception: workspaceConfig.colors.error,
      err: workspaceConfig.colors.error,
      error: workspaceConfig.colors.error,
      fatal: workspaceConfig.colors.fatal,
      warn: workspaceConfig.colors.warning,
      info: workspaceConfig.colors.info,
      debug: workspaceConfig.colors.primary,
      trace: workspaceConfig.colors.primary,
      "req.url": workspaceConfig.colors.primary,
      success: workspaceConfig.colors.success
    };
  }

  let fileOptions!: PinoLoggerOptions;
  let stream!: DestinationStream;
  if (isRuntimeServer()) {
    stream = createFileTransport(
      loggingConfig.path,
      loggingConfig.fileName,
      loggingConfig.fileExtension
    );

    fileOptions = {
      name: `${projectName} - Log File`,
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: {
          destination: stream,
          errorLikeObjectKeys: ["err", "error", "exception"],
          minimumLevel: loggingConfig.level,
          messageKey: "msg",
          errorKey: "error",
          timestampKey: "time",
          messageFormat: `
***********************************************
Timestamp: {time}
Log Level: {levelLabel} {if pid}
Process ID: {pid}{end}{if req.url}
Request URL: {req.url}{end}
Message: {msg}
***********************************************
`,
          singleLine: false,
          hideObject: false,
          mkdir: true,
          append: true
        }
      }
    };
  }

  return {
    console: { options: consoleOptions },
    file: fileOptions && stream ? { options: fileOptions, stream } : undefined
  };
};
