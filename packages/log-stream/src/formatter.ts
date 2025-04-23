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

import type {
  FormattedValues,
  LogLevel,
  LogRecord
} from "@storm-stack/types/log";
import { StormJSON } from "@stryke/json/storm-json";
import util from "node:util";
import type {
  AnsiColor,
  AnsiColorFormatterOptions,
  AnsiStyle,
  TextFormatter,
  TextFormatterOptions
} from "./types";

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
 * and in Node.js/Bun it is `util.inspect()`.  If neither is available, it
 * falls back to {@link JSON.stringify}.
 *
 * @param value The value to inspect.
 * @param options The options for inspecting the value.
 *                If `colors` is `true`, the output will be ANSI-colored.
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
        // eslint-disable-next-line ts/no-unsafe-call
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
      : v => StormJSON.stringify(v);

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
 * ```
 * 2023-11-14 22:13:20.000 +00:00 [INFO] Hello, world!
 * ```
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
  const formatter: (values: FormattedValues) => string =
    options.format ??
    (({ timestamp, level, message }: FormattedValues) =>
      `${timestamp} [${level}] ${message}`);

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

    return `${formatter(values)}\n`;
  };
}

/**
 * The default text formatter.  This formatter formats log records as follows:
 *
 * ```
 * 2023-11-14 22:13:20.000 +00:00 [INFO] Hello, world!
 * ```
 *
 * @param record The log record to format.
 * @returns The formatted log record.
 */
export const defaultTextFormatter: TextFormatter = getTextFormatter();

const RESET = "\x1B[0m";

const ansiColors: Record<AnsiColor, string> = {
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m"
};

const ansiStyles: Record<AnsiStyle, string> = {
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  italic: "\x1B[3m",
  underline: "\x1B[4m",
  strikethrough: "\x1B[9m"
};

const defaultLevelColors: Record<LogLevel, AnsiColor | null> = {
  debug: "blue",
  info: "green",
  warning: "yellow",
  error: "red",
  fatal: "magenta"
};

/**
 * Get an ANSI color formatter with the specified options.
 *
 * ![A preview of an ANSI color formatter.](https://i.imgur.com/I8LlBUf.png)
 *
 * @param options - The options for the ANSI color formatter.
 * @returns The ANSI color formatter.
 */
export function getAnsiColorFormatter(
  options: AnsiColorFormatterOptions = {}
): TextFormatter {
  const format = options.format;
  const timestampStyle =
    typeof options.timestampStyle === "undefined"
      ? "dim"
      : options.timestampStyle;
  const timestampColor = options.timestampColor ?? null;
  const timestampPrefix = `${
    timestampStyle == null ? "" : ansiStyles[timestampStyle]
  }${timestampColor == null ? "" : ansiColors[timestampColor]}`;
  const timestampSuffix =
    timestampStyle == null && timestampColor == null ? "" : RESET;
  const levelStyle =
    typeof options.levelStyle === "undefined" ? "bold" : options.levelStyle;
  const levelColors = options.levelColors ?? defaultLevelColors;
  // const categoryStyle =
  //   typeof options.categoryStyle === "undefined"
  //     ? "dim"
  //     : options.categoryStyle;
  // const categoryColor = options.categoryColor ?? null;
  // const categoryPrefix = `${
  //   categoryStyle == null ? "" : ansiStyles[categoryStyle]
  // }${categoryColor == null ? "" : ansiColors[categoryColor]}`;
  // const categorySuffix =
  //   categoryStyle == null && categoryColor == null ? "" : RESET;

  return getTextFormatter({
    timestamp: "date-time-tz",
    value(value: unknown): string {
      return inspect(value, { colors: true });
    },
    ...options,
    format: ({ timestamp, level, message, record }): string => {
      const levelColor = levelColors[record.level];
      timestamp = `${timestampPrefix}${timestamp}${timestampSuffix}`;
      level = `${levelStyle == null ? "" : ansiStyles[levelStyle]}${
        levelColor == null ? "" : ansiColors[levelColor]
      }${level}${levelStyle == null && levelColor == null ? "" : RESET}`;

      return format == null
        ? `${timestamp} ${level} ${message}`
        : format({
            timestamp,
            level,
            message,
            record
          });
    }
  });
}

/**
 * A text formatter that uses ANSI colors to format log records.
 *
 * ![A preview of ansiColorFormatter.](https://i.imgur.com/I8LlBUf.png)
 *
 * @param record The log record to format.
 * @returns The formatted log record.
 * @since 0.5.0
 */
export const ansiColorFormatter: TextFormatter = getAnsiColorFormatter();
