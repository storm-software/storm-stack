/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { Options } from "@storm-stack/core/types";
import type { LogPluginConfig } from "@storm-stack/devkit/plugins/log";
import LogPlugin from "@storm-stack/devkit/plugins/log";

export default class LogConsolePlugin<
  TOptions extends Options = Options
> extends LogPlugin<TOptions> {
  public constructor(config: LogPluginConfig) {
    super(config, "log-console-plugin", "@storm-stack/plugin-log-console");
  }

  protected override writeSink() {
    return `${getFileHeader()}

import type { LogLevel, LogRecord } from "@storm-stack/types/log";

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

// Using \`[]\` sets the default locale properly from the system!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters
export const DATE_TIME_FORMAT = new Intl.DateTimeFormat([], {
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false,
});

/**
 * The default console formatter.
 *
 * @param record - The log record to format.
 * @returns The formatted log record, as an array of arguments for {@link console.log}.
 */
function formatter(record: LogRecord): readonly any[] {
  let msg = "";
  const values: any[] = [];

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
    \`%c\${DATE_TIME_FORMAT.format(date)}:\${date.getUTCSeconds().toString().padStart(2, "0")}.\${date
      .getUTCMilliseconds()
      .toString()
      .padStart(3, "0")} %c\${levelAbbreviations[record.level]}%c %c\${msg}\`,
    "color: gray;",
    logLevelStyles[record.level],
    "background-color: default;",
    "color: gray;",
    "color: default;",
    ...values
  ];
}

function write(level: LogLevel, ...message: unknown[]) {
  switch (level) {
    case "fatal":
    case "error":
      console.error(...message);
      break;
    case "warning":
      console.warn(...message);
      break;
    case "info":
      console.info(...message);
      break;
    case "debug":
      console.debug(...message);
      break;
    default:
      console.log(...message);
  }
}

const sink = (record: LogRecord) => {
  const args = formatter(record);
  if (typeof args === "string") {
    const msg = String(args).replace(/\\r?\\n$/, "");
    write(record.level, msg);
  } else {
    write(record.level, ...args);
  }
};

export default sink;
  `;
  }
}
