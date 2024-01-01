import { StormConfig } from "@storm-software/config-tools";
import {
  StormDateTime,
  formatDate,
  formatDateTime
} from "@storm-stack/date-time";
import { isStormError } from "@storm-stack/errors";
import {
  EMPTY_STRING,
  isRuntimeServer,
  isSetString,
  titleCase
} from "@storm-stack/utilities";
import { tmpdir } from "os";
import { join } from "path";
import pino, {
  DestinationStream,
  LoggerOptions as PinoLoggerOptions
} from "pino";
import pretty, { PrettyOptions } from "pino-pretty";
import { LoggingConfig } from "../types";
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
export const getPinoLogger = (
  config: StormConfig<"logging", LoggingConfig>,
  name?: string
) => {
  const loggingConfig = config.extensions?.logging ?? {};

  let logPath = loggingConfig.path;
  if (!isSetString(logPath)) {
    logPath = join(tmpdir(), "storm", "logs");
  }

  config.logLevel ??= config.env === "production" ? "info" : "debug";
  loggingConfig.stacktrace ??=
    config?.env === "production" && !isRuntimeServer() ? false : true;
  const errorSerializer = createErrorSerializer(loggingConfig.stacktrace);

  const baseOptions: PinoLoggerOptions = {
    enabled: getLogLevel(config.logLevel) > LogLevel.SILENT,
    level: config.logLevel,
    messageKey: "msg",
    errorKey: "error",
    timestamp: () => formatDateTime(),
    serializers: {
      exception: errorSerializer(loggingConfig.stacktrace),
      err: errorSerializer(loggingConfig.stacktrace),
      error: errorSerializer(loggingConfig.stacktrace),
      fatal: errorSerializer(loggingConfig.stacktrace)
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

  let streams: Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> = [
    { stream: pretty(prettyOptions) }
  ];

  if (isRuntimeServer()) {
    const pinoServerOptions = {
      options: {
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

    streams.push(
      pino.transport({
        targets: [
          {
            target: "pino/file",
            options: {
              ...pinoServerOptions,
              destination: pino.destination({
                dest: join(
                  logPath,
                  formatDate().replaceAll("/", "-").replaceAll(" ", "-"),
                  `${
                    (loggingConfig.fileName
                      ? loggingConfig.fileName
                      : "storm") + "-"
                  }${formatDateTime(StormDateTime.current(), {
                    smallestUnit: "second",
                    roundingMode: "ceil",
                    calendarName: "never",
                    timeZoneName: "never",
                    offset: "never"
                  })
                    .replaceAll("/", "-")
                    .replaceAll(" ", "-")
                    .replaceAll(":", "-")
                    .replaceAll(".", "-")}.${
                    loggingConfig.fileExtension
                      ? loggingConfig.fileExtension.replaceAll(
                          ".",
                          EMPTY_STRING
                        )
                      : "log"
                  }`
                ),
                minLength: 4096,
                sync: false,
                mkdir: true,
                append: true
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
                    loggingConfig.fileName
                      ? loggingConfig.fileName + "-"
                      : EMPTY_STRING
                  }error-${formatDateTime(StormDateTime.current(), {
                    smallestUnit: "second",
                    roundingMode: "ceil",
                    calendarName: "never",
                    timeZoneName: "never",
                    offset: "never"
                  })
                    .replaceAll("/", "-")
                    .replaceAll(" ", "-")
                    .replaceAll(":", "-")
                    .replaceAll(".", "-")}.${
                    loggingConfig.fileExtension
                      ? loggingConfig.fileExtension.replaceAll(
                          ".",
                          EMPTY_STRING
                        )
                      : "log"
                  }`
                ),
                minLength: 4096,
                sync: false,
                mkdir: true,
                append: true
              })
            }
          }
        ],
        dedupe: true
      })
    );

    if (
      loggingConfig.loki?.host &&
      loggingConfig.loki?.username &&
      loggingConfig.loki?.password
    ) {
      streams.push(
        pino.transport({
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
        })
      );
    }
  }

  return pino(baseOptions, pino.multistream(streams));
};
