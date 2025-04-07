/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import type { LogLevel, LogRecord } from "@storm-stack/core/types";

/**
 * The severity level abbreviations.
 */
const levelAbbreviations: Record<LogLevel, string> = {
  "debug": "DBG",
  "info": "INF",
  "warning": "WRN",
  "error": "ERR",
  "fatal": "FTL"
};

/**
 * The styles for the log level in the console.
 */
const logLevelStyles: Record<LogLevel, string> = {
  "debug": "background-color: gray; color: white;",
  "info": "background-color: white; color: black;",
  "warning": "background-color: orange; color: black;",
  "error": "background-color: red; color: white;",
  "fatal": "background-color: maroon; color: white;"
};

/**
 * The default console formatter.
 *
 * @param record - The log record to format.
 * @returns The formatted log record, as an array of arguments for {@link console.log}.
 */
export function defaultConsoleFormatter(record: LogRecord): readonly unknown[] {
  let msg = "";
  const values: unknown[] = [];

  for (let i = 0; i < record.message.length; i++) {
    if (i % 2 === 0 && typeof record.message[i] === "string") {
      msg += record.message[i] as string;
    } else {
      msg += "%o";
      values.push(record.message[i]);
    }
  }

  const date = new Date(record.timestamp);

  return [
    `%c${date.getUTCMonth()}/${date.getUTCDay()}/${date.getUTCFullYear()} ${date.getUTCHours().toString().padStart(2, "0")}:${date
      .getUTCMinutes()
      .toString()
      .padStart(
        2,
        "0"
      )}:${date.getUTCSeconds().toString().padStart(2, "0")}.${date
      .getUTCMilliseconds()
      .toString()
      .padStart(3, "0")} %c${levelAbbreviations[record.level]}%c %c${msg}`,
    "color: gray;",
    logLevelStyles[record.level],
    "background-color: default;",
    "color: gray;",
    "color: default;",
    ...values
  ];
}
