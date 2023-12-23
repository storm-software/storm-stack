import { StormConfig } from "@storm-software/config-tools";
import { formatDate, formatDateTime } from "@storm-stack/date-time";
import { isStormError } from "@storm-stack/errors";
import {
  EMPTY_STRING,
  isRuntimeServer,
  isSetString,
  titleCase
} from "@storm-stack/utilities";
import chalk from "chalk";
import { tmpdir } from "os";
import { join } from "path";
import pino, {
  DestinationStream,
  LoggerOptions as PinoLoggerOptions,
  TransportTargetOptions
} from "pino";
import { LoggingConfig } from "../types";
import { LogLevel, getLogLevel } from "./get-log-level";

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
export const getTransports = (
  config: StormConfig<"logging", LoggingConfig>,
  name?: string
) => {
  const loggingConfig = config.extensions?.logging ?? {};

  let logPath = loggingConfig.path;
  if (!isSetString(logPath)) {
    logPath = join(tmpdir(), "storm", "logs");
  }

  config.logLevel ??= config.env === "production" ? "error" : "debug";
  loggingConfig.stacktrace ??= config?.env === "production" ? false : true;

  const baseOptions: PinoLoggerOptions = {
    enabled: getLogLevel(config.logLevel) > LogLevel.SILENT,
    level: config.logLevel,
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
      disabled: getLogLevel(config.logLevel) === LogLevel.SILENT
    }
  };

  let transports: TransportTargetOptions[] = [
    {
      target: "pino-pretty",
      options: {
        ...baseOptions,
        msgPrefix: "STORM",
        destination: 1, // 1 = stdout
        colorize: true,
        colorizeObjects: true,
        errorLikeObjectKeys: ["err", "error", "exception"],
        minimumLevel: config.logLevel,
        messageKey: "msg",
        errorKey: "error",
        timestampKey: "time",
        messageFormat:
          "[{time}] {levelLabel} ({if pid}{pid} - {end}{req.url}: {msg}",
        singleLine: false,
        hideObject: false,
        customColors: {}
      }
    }
  ];
  if (config.colors) {
    transports = transports.map(transport => {
      if (transport.options) {
        transport.options.customColors = {
          exception: config.colors.error,
          err: config.colors.error,
          error: config.colors.error,
          fatal: config.colors.fatal,
          warn: config.colors.warning,
          info: config.colors.info,
          debug: config.colors.primary,
          trace: config.colors.primary,
          "req.url": config.colors.primary,
          success: config.colors.success
        };
        transport.options.msgPrefix = chalk.bold.hex(config.colors.primary)(
          "STORM"
        );
      }

      return transport;
    });
  }

  if (isRuntimeServer()) {
    const pinoServerOptions = {
      options: {
        ...baseOptions,
        errorLikeObjectKeys: ["err", "error", "exception"],
        minimumLevel: config.logLevel,
        messageKey: "msg",
        errorKey: "error",
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
        hideObject: false,
        mkdir: true,
        append: true
      }
    };

    transports.push(
      ...[
        {
          target: "pino/file",
          options: {
            ...pinoServerOptions,
            destination: pino.destination({
              dest: join(
                logPath,
                formatDate().replaceAll("/", "-").replaceAll(" ", "-"),
                `${
                  loggingConfig.fileName
                    ? loggingConfig.fileName + "-"
                    : EMPTY_STRING
                }${formatDateTime()
                  .replaceAll("/", "-")
                  .replaceAll(" ", "-")
                  .replaceAll(":", "-")}.${
                  loggingConfig.fileExtension
                    ? loggingConfig.fileExtension.replaceAll(".", EMPTY_STRING)
                    : "log"
                }}`
              ),
              minLength: 4096,
              sync: false
            })
          }
        },
        {
          target: "pino/file",
          level: "error",
          options: {
            ...pinoServerOptions,
            destination: pino.destination({
              dest: join(
                logPath,
                formatDate().replaceAll("/", "-").replaceAll(" ", "-"),
                `${
                  config.extensions.logging.fileName
                    ? config.extensions.logging.fileName + "-"
                    : EMPTY_STRING
                }-error-${formatDateTime()
                  .replaceAll("/", "-")
                  .replaceAll(" ", "-")
                  .replaceAll(":", "-")}.${
                  loggingConfig.fileExtension
                    ? loggingConfig.fileExtension.replaceAll(".", EMPTY_STRING)
                    : "log"
                }}`
              ),
              minLength: 4096,
              sync: false
            })
          }
        }
      ]
    );

    if (
      loggingConfig.loki?.host &&
      loggingConfig.loki?.username &&
      loggingConfig.loki?.password
    ) {
      transports.push({
        target: "pino-loki",
        options: {
          batching: true,
          interval: 5,
          host: loggingConfig.loki?.host,
          basicAuth: {
            username: loggingConfig.loki?.username,
            password: loggingConfig.loki?.password
          }
        }
      });
    }
  }

  return pino.transport({
    targets: transports
  });
};
