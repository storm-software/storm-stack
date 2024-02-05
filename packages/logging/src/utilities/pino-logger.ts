import type { StormConfig } from "@storm-software/config-tools";
import { formatDateTime } from "@storm-stack/date-time";
import { isStormError } from "@storm-stack/errors";
import { isRuntimeServer, titleCase } from "@storm-stack/utilities";
import pino, { type DestinationStream, type LoggerOptions as PinoLoggerOptions } from "pino";
import pretty, { type PrettyOptions } from "pino-pretty";
import type { LoggingConfig } from "../types";
import { createFileStreamLogs } from "./file-stream-logs";
import { LogLevel, getLogLevel } from "./get-log-level";
import { createErrorSerializer } from "./log-serializer";

export type LoggerOptions = {
  options: PinoLoggerOptions;
  stream?: DestinationStream;
};

/**
 * Get the Pino transports for the logger
 *
 * @param config - The workspace config
 * @param name - The name of the logger to get the options for
 * @returns The options for the logger
 */
export const getPinoLogger = (config: StormConfig<"logging", LoggingConfig>, name?: string) => {
  const loggingConfig = config.extensions?.logging ?? {};

  config.logLevel ??= config.env === "production" ? "info" : "debug";
  loggingConfig.stacktrace ??= config?.env === "production" && !isRuntimeServer() ? false : true;
  const errorSerializer = createErrorSerializer(loggingConfig.stacktrace);

  const baseOptions: PinoLoggerOptions = {
    enabled: getLogLevel(config.logLevel) > LogLevel.SILENT,
    level: config.logLevel,
    messageKey: "msg",
    errorKey: "error",
    timestamp: () => formatDateTime(),
    serializers: {
      exception: errorSerializer,
      err: errorSerializer,
      error: errorSerializer,
      fatal: errorSerializer
    },
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
          ? { ...object, error: object.err }
          : isStormError(object.err)
            ? { ...object, error: object.err }
            : isStormError(object.exception)
              ? { ...object, error: object.exception }
              : object
    },
    browser: {
      disabled: getLogLevel(config.logLevel) === LogLevel.SILENT
    }
  };

  const prettyOptions: PrettyOptions = {
    destination: 1, // 1 = stdout
    colorize: true,
    colorizeObjects: true,
    errorLikeObjectKeys: ["err", "error", "exception"],
    minimumLevel: config.logLevel,
    messageKey: "msg",
    timestampKey: "time",
    messageFormat: `
***********************************************
Name: ${name ? name : config.name}
Timestamp: {time}
Log Level: {levelLabel} {if pid}
Process ID: {pid}{end}{if req.url}
Request URL: {req.url}{end}
Message: {msg}
***********************************************
    `,
    singleLine: false,
    hideObject: false
  };

  if (config.colors) {
    prettyOptions.customColors = `exception:${config.colors.error},err:${config.colors.error},error:${config.colors.error},fatal:${config.colors.fatal},warn:${config.colors.warning},info:${config.colors.info},debug:${config.colors.primary},trace:${config.colors.primary},req.url:${config.colors.primary},success:${config.colors.success}`;
  }

  const streams: Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> = [
    { stream: pretty(prettyOptions) }
  ];

  if (isRuntimeServer()) {
    streams.push(...createFileStreamLogs(config));
  }

  return pino(baseOptions, pino.multistream(streams, { dedupe: false }));
};
