/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { PluginOptions } from "@storm-stack/core/base/plugin";
import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { LogPluginConfig } from "@storm-stack/devkit/plugins/log";
import LogPlugin from "@storm-stack/devkit/plugins/log";

export type LogStoragePluginConfig = LogPluginConfig & {
  /**
   * Whether to use the file system storage driver.
   *
   * @defaultValue true
   */
  useFileSystem?: boolean;

  /**
   * The storage ID to use for the log storage.
   *
   * @defaultValue "logs"
   */
  namespace?: string;
};

export default class LogStoragePlugin extends LogPlugin<LogStoragePluginConfig> {
  public constructor(options: PluginOptions<LogStoragePluginConfig>) {
    super(options);

    this.options.useFileSystem ??= true;
    this.options.namespace ??= "logs";

    if (this.options.useFileSystem) {
      this.dependencies.push([
        "@storm-stack/plugin-storage-fs",
        {
          namespace: this.options.namespace,
          envPath: "log"
        }
      ]);
    }
  }

  protected override writeSink() {
    return `${getFileHeader()}

import type { LogRecord, LogSink } from "@storm-stack/types/log";
import type { StorageValue } from "unstorage";
import type {
  TextFormatter,
  TextFormatterOptions
} from "@storm-stack/plugin-log-storage/types";
import type {
  FormattedValues,
  LogLevel,
  LogRecord
} from "@storm-stack/types/log";
import util from "node:util";
import { storage } from "../storage";

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
 * A platform-specific inspect function.  In Deno, this is {@link Deno.inspect},
 * and in Node.js/Bun it is \`util.inspect()\`.  If neither is available, it
 * falls back to {@link JSON.stringify}.
 *
 * @param value - The value to inspect.
 * @param options - The options for inspecting the value. If \`colors\` is \`true\`, the output will be ANSI-colored.
 * @returns The string representation of the value.
 */
const inspect: (value: unknown, options?: { colors?: boolean }) => string =
  // @ts-ignore: Deno global
  // dnt-shim-ignore
  "Deno" in globalThis &&
  "inspect" in (globalThis as any).Deno &&
  // @ts-ignore: Deno global
  // dnt-shim-ignore
  typeof globalThis.Deno.inspect === "function"
    ? (v, opts) =>
        // @ts-ignore: Deno global
        // dnt-shim-ignore
        globalThis.Deno.inspect(v, {
          strAbbreviateSize: Infinity,
          iterableLimit: Infinity,
          ...opts
        })
    : // @ts-ignore: Node.js global
      // dnt-shim-ignore
      util != null && "inspect" in util && typeof util.inspect === "function"
      ? (v, opts) =>
          // @ts-ignore: Node.js global
          // dnt-shim-ignore
          util.inspect(v, {
            maxArrayLength: Infinity,
            maxStringLength: Infinity,
            ...opts
          })
      : v => JSON.stringify(v);

/**
 * Get a text formatter with the specified options.  Although it's flexible
 * enough to create a custom formatter, if you want more control, you can
 * create a custom formatter that satisfies the {@link TextFormatter} type
 * instead.
 *
 * For more information on the options, see {@link TextFormatterOptions}.
 *
 * By default, the formatter formats log records as follows:
 *
 * \`\`\`
 * 2023-11-14 22:13:20.000 +00:00 [INFO] Hello, world!
 * \`\`\`
 * @param options - The options for the text formatter.
 * @returns The text formatter.
 */
export function getTextFormatter(
  options: TextFormatterOptions = {}
): TextFormatter {
  const timestampRenderer =
    options.timestamp == null || options.timestamp === "date-time-timezone"
      ? (ts: number): string =>
          new Date(ts).toISOString().replace("T", " ").replace("Z", " +00:00")
      : options.timestamp === "date-time-tz"
        ? (ts: number): string =>
            new Date(ts).toISOString().replace("T", " ").replace("Z", " +00")
        : options.timestamp === "date-time"
          ? (ts: number): string =>
              new Date(ts).toISOString().replace("T", " ").replace("Z", "")
          : options.timestamp === "time-timezone"
            ? (ts: number): string =>
                new Date(ts)
                  .toISOString()
                  .replace(/.*T/, "")
                  .replace("Z", " +00:00")
            : options.timestamp === "time-tz"
              ? (ts: number): string =>
                  new Date(ts)
                    .toISOString()
                    .replace(/.*T/, "")
                    .replace("Z", " +00")
              : options.timestamp === "time"
                ? (ts: number): string =>
                    new Date(ts)
                      .toISOString()
                      .replace(/.*T/, "")
                      .replace("Z", "")
                : options.timestamp === "date"
                  ? (ts: number): string =>
                      new Date(ts).toISOString().replace(/T.*/, "")
                  : options.timestamp === "rfc3339"
                    ? (ts: number): string => new Date(ts).toISOString()
                    : options.timestamp;
  const valueRenderer = options.value ?? inspect;
  const levelRenderer =
    options.level == null || options.level === "ABBR"
      ? (level: LogLevel): string => levelAbbreviations[level] || ""
      : options.level === "abbr"
        ? (level: LogLevel): string =>
            (levelAbbreviations[level] || "").toLowerCase()
        : options.level === "FULL"
          ? (level: LogLevel): string => level.toUpperCase()
          : options.level === "full"
            ? (level: LogLevel): string => level
            : options.level === "L"
              ? (level: LogLevel): string => level.charAt(0).toUpperCase()
              : options.level === "l"
                ? (level: LogLevel): string => level.charAt(0)
                : options.level;

  const _formatter: (values: FormattedValues) => string =
    options.format ??
    (({ timestamp, level, message }: FormattedValues) =>
      \`\${timestamp} [\${level}] \${message}\`);

  return (record: LogRecord): string => {
    let message = "";
    for (let i = 0; i < record.message.length; i++) {
      if (i % 2 === 0 && typeof record.message[i] === "string") {
        message += record.message[i] as string;
      } else {
        message += valueRenderer(record.message[i]);
      }
    }

    const timestamp = timestampRenderer(record.timestamp);
    const level = levelRenderer(record.level);
    const values: FormattedValues = {
      timestamp,
      level,
      message,
      record
    };

    return \`\${_formatter(values)}\n\`;
  };
}

/**
 * The default text formatter.  This formatter formats log records as follows:
 *
 * \`\`\`
 * 2023-11-14 22:13:20.000 +00:00 [INFO] Hello, world!
 * \`\`\`
 *
 * @returns The formatted log record.
 */
const formatter: TextFormatter = getTextFormatter();

const sink: LogSink & AsyncDisposable = (record: LogRecord) => {
  void storage.setItem(
    \`${this.options.namespace}:storm-\${new Date().toISOString().replace("T", "_").replace("Z", "")}.log\`,
    formatter(record)
  );
};

sink[Symbol.asyncDispose] = async () => storage.dispose();

export default sink;
`;
  }
}
