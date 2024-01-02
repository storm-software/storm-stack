import { StormConfig } from "@storm-software/config-tools";
import {
  StormDateTime,
  formatDate,
  formatDateTime
} from "@storm-stack/date-time";
import { EMPTY_STRING, isSetString } from "@storm-stack/utilities";
import { tmpdir } from "os";
import { join } from "path";
import pino from "pino";
import pinoLoki from "pino-loki";
import { LoggingConfig } from "../types";

/**
 * Get the Pino transports for the logger
 *
 * @param config - The workspace config
 * @param name - The name of the logger to get the options for
 * @returns The options for the logger
 */
export const createFileStreamLogs = (
  config: StormConfig<"logging", LoggingConfig>
): Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> => {
  const loggingConfig = config.extensions?.logging ?? {};

  let logPath = loggingConfig.path;
  if (!isSetString(logPath)) {
    logPath = join(tmpdir(), "storm", "logs");
  }

  let streams: Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> =
    [];

  streams.push({
    level: "debug",
    stream: pino.destination({
      dest: join(
        logPath,
        formatDate().replaceAll("/", "-").replaceAll(" ", "-"),
        `${
          (loggingConfig.fileName ? loggingConfig.fileName : "storm") + "-"
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
            ? loggingConfig.fileExtension.replaceAll(".", EMPTY_STRING)
            : "log"
        }`
      ),
      minLength: 4096,
      sync: false,
      mkdir: true,
      append: true
    })
  });

  /*streams.push({
    level: "error",
    stream: createWriteStream(
      join(
        logPath,
        formatDate().replaceAll("/", "-").replaceAll(" ", "-"),
        `${
          loggingConfig.fileName ? loggingConfig.fileName + "-" : EMPTY_STRING
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
            ? loggingConfig.fileExtension.replaceAll(".", EMPTY_STRING)
            : "log"
        }`
      )
    )
  });*/

  if (
    loggingConfig.loki?.host &&
    loggingConfig.loki?.username &&
    loggingConfig.loki?.password
  ) {
    streams.push({
      level: "info",
      stream: pinoLoki({
        batching: true,
        interval: 5,
        host: loggingConfig.loki?.host,
        basicAuth: {
          username: loggingConfig.loki?.username,
          password: loggingConfig.loki?.password
        }
      })
    });
  }

  return streams;
};
