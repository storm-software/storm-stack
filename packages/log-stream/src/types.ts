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

/**
 * A text formatter is a function that accepts a log record and returns a string.
 *
 * @param record - The log record to format.
 * @returns The formatted log record.
 */
export type TextFormatter = (record: LogRecord) => string;

export type TextFormatterTimestamp =
  | "date-time-timezone"
  | "date-time-tz"
  | "date-time"
  | "time-timezone"
  | "time-tz"
  | "time"
  | "date"
  | "rfc3339"
  | ((ts: number) => string);

/**
 * The various options for the built-in text formatters.
 */
export interface TextFormatterOptions {
  /**
   * The timestamp format.  This can be one of the following:
   *
   * - `"date-time-timezone"`: The date and time with the full timezone offset
   *   (e.g., `"2023-11-14 22:13:20.000 +00:00"`).
   * - `"date-time-tz"`: The date and time with the short timezone offset
   *   (e.g., `"2023-11-14 22:13:20.000 +00"`).
   * - `"date-time"`: The date and time without the timezone offset
   *   (e.g., `"2023-11-14 22:13:20.000"`).
   * - `"time-timezone"`: The time with the full timezone offset but without
   *   the date (e.g., `"22:13:20.000 +00:00"`).
   * - `"time-tz"`: The time with the short timezone offset but without the date
   *   (e.g., `"22:13:20.000 +00"`).
   * - `"time"`: The time without the date or timezone offset
   *   (e.g., `"22:13:20.000"`).
   * - `"date"`: The date without the time or timezone offset
   *   (e.g., `"2023-11-14"`).
   * - `"rfc3339"`: The date and time in RFC 3339 format
   *   (e.g., `"2023-11-14T22:13:20.000Z"`).
   *
   * Alternatively, this can be a function that accepts a timestamp and returns a string.
   *
   * The default is `"date-time-timezone"`.
   */
  timestamp?: TextFormatterTimestamp;

  /**
   * The log level format.  This can be one of the following:
   *
   * - `"ABBR"`: The log level abbreviation in uppercase (e.g., `"INF"`).
   * - `"FULL"`: The full log level name in uppercase (e.g., `"INFO"`).
   * - `"L"`: The first letter of the log level in uppercase (e.g., `"I"`).
   * - `"abbr"`: The log level abbreviation in lowercase (e.g., `"inf"`).
   * - `"full"`: The full log level name in lowercase (e.g., `"info"`).
   * - `"l"`: The first letter of the log level in lowercase (e.g., `"i"`).
   *
   * Alternatively, this can be a function that accepts a log level and returns a string.
   *
   * @defaultValue "FULL"
   */
  level?:
    | "ABBR"
    | "FULL"
    | "L"
    | "abbr"
    | "full"
    | "l"
    | ((level: LogLevel) => string);

  /**
   * The separator between category names.  For example, if the separator is `"·"`, the category `["a", "b", "c"]` will be formatted as `"a·b·c"`. The default separator is `"·"`.
   *
   * If this is a function, it will be called with the category array and should return a string, which will be used for rendering the category.
   */
  // category?: string | ((category: readonly string[]) => string);

  /**
   * The format of the embedded values.
   *
   * A function that renders a value to a string.  This function is used to render the values in the log record.  The default is [`util.inspect()`] in Node.js/Bun and [`Deno.inspect()`] in Deno.
   *
   * [`util.inspect()`]: https://nodejs.org/api/util.html#utilinspectobject-options
   * [`Deno.inspect()`]: https://docs.deno.com/api/deno/~/Deno.inspect
   * @param value - The value to render.
   * @returns The string representation of the value.
   */
  value?: (value: unknown) => string;

  /**
   * How those formatted parts are concatenated.
   *
   * A function that formats the log record.  This function is called with the formatted values and should return a string.  Note that the formatted should not* include a newline character at the end.
   *
   * By default, this is a function that formats the log record as follows:
   *
   * ```
   * 2023-11-14 22:13:20.000 +00:00 [INFO] Hello, world!
   * ```
   * @param values - The formatted values.
   * @returns The formatted log record.
   */
  format?: (values: FormattedValues) => string;
}

/**
 * The ANSI text styles.
 */
export type AnsiStyle =
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "strikethrough";

/**
 * The ANSI colors.  These can be used to colorize text in the console.
 */
export type AnsiColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white";

/**
 * The various options for the ANSI color formatter.
 */
export interface AnsiColorFormatterOptions extends TextFormatterOptions {
  /**
   * The timestamp format.  This can be one of the following:
   *
   * - `"date-time-timezone"`: The date and time with the full timezone offset
   *   (e.g., `"2023-11-14 22:13:20.000 +00:00"`).
   * - `"date-time-tz"`: The date and time with the short timezone offset
   *   (e.g., `"2023-11-14 22:13:20.000 +00"`).
   * - `"date-time"`: The date and time without the timezone offset
   *   (e.g., `"2023-11-14 22:13:20.000"`).
   * - `"time-timezone"`: The time with the full timezone offset but without
   *   the date (e.g., `"22:13:20.000 +00:00"`).
   * - `"time-tz"`: The time with the short timezone offset but without the date
   *   (e.g., `"22:13:20.000 +00"`).
   * - `"time"`: The time without the date or timezone offset
   *   (e.g., `"22:13:20.000"`).
   * - `"date"`: The date without the time or timezone offset
   *   (e.g., `"2023-11-14"`).
   * - `"rfc3339"`: The date and time in RFC 3339 format
   *   (e.g., `"2023-11-14T22:13:20.000Z"`).
   *
   * Alternatively, this can be a function that accepts a timestamp and returns a string.
   *
   * @defaultValue `"date-time-tz"`.
   */
  timestamp?:
    | "date-time-timezone"
    | "date-time-tz"
    | "date-time"
    | "time-timezone"
    | "time-tz"
    | "time"
    | "date"
    | "rfc3339"
    | ((ts: number) => string);

  /**
   * The ANSI style for the timestamp.  `"dim"` is used by default.
   */
  timestampStyle?: AnsiStyle | null;

  /**
   * The ANSI color for the timestamp. No color is used by default.
   */
  timestampColor?: AnsiColor | null;

  /**
   * The ANSI style for the log level. `"bold"` is used by default.
   */
  levelStyle?: AnsiStyle | null;

  /**
   * The ANSI colors for the log levels. The default colors are as follows:
   *
   * - `"debug"`: `"blue"`
   * - `"info"`: `"green"`
   * - `"warning"`: `"yellow"`
   * - `"error"`: `"red"`
   * - `"fatal"`: `"magenta"`
   */
  levelColors?: Record<LogLevel, AnsiColor | null>;

  /**
   * The ANSI style for the category.  `"dim"` is used by default.
   */
  // categoryStyle?: AnsiStyle | null;

  /**
   * The ANSI color for the category.  No color is used by default.
   */
  // categoryColor?: AnsiColor | null;
}

/**
 * Options for the {@link getSink} function.
 */
export interface StreamSinkOptions {
  /**
   * The text formatter to use. Defaults to {@link defaultTextFormatter}.
   */
  formatter?: TextFormatter;

  /**
   * The text encoder to use. Defaults to an instance of {@link TextEncoder}.
   */
  encoder?: { encode: (text: string) => Uint8Array };
}
