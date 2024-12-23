/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import type { StormConfig } from "@storm-software/config";
import { StormDate } from "@storm-stack/date-time/storm-date";
import { StormDateTime } from "@storm-stack/date-time/storm-date-time";
import { formatDate, formatDateTime } from "@storm-stack/date-time/utilities";
import { isSetString } from "@storm-stack/types/type-checks/is-set-string";
import { EMPTY_STRING } from "@storm-stack/types/utility-types/base";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pino from "pino";
import pinoLoki from "pino-loki";
import type { TelemetryConfig } from "../types";

/**
 * Get the Pino transports for the logger
 *
 * @param config - The workspace config
 * @param name - The name of the logger to get the options for
 * @returns The options for the logger
 */
export const createFileStreamLogs = (
  config: StormConfig<"telemetry", TelemetryConfig>
): Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> => {
  const loggingConfig = config.extensions?.telemetry?.logging ?? {};
  const streams: Array<pino.DestinationStream | pino.StreamEntry<pino.Level>> =
    [];

  if (!loggingConfig.fileLoggingDisabled) {
    let logPath = loggingConfig.path;
    if (!isSetString(logPath)) {
      logPath = join(tmpdir(), "storm", "logs");
    }

    streams.push({
      level: "trace",
      stream: pino.destination({
        dest: join(
          logPath,
          formatDate(StormDate.current())
            .replaceAll("/", "-")
            .replaceAll(" ", "-"),
          `${`${loggingConfig.fileName || "storm"}-`}${formatDateTime(
            StormDateTime.current(),
            {
              smallestUnit: "second",
              roundingMode: "ceil",
              calendarName: "never",
              timeZoneName: "never",
              offset: "never"
            }
          )
            .replaceAll("/", "-")
            .replaceAll(":", "-")
            .replaceAll(".", "-")
            .replaceAll(" ", "_")}.${
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

    /* streams.push({
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
  }); */
  }

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
