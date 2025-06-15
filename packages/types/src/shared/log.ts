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

/**
 * A logging callback function.  It is used to defer the computation of a
 * message template until it is actually logged.
 * @param prefix - The message template prefix.
 * @returns The rendered message array.
 */
export type LogCallback = (prefix: LogTemplatePrefix) => unknown[];

/**
 * A logging template prefix function.  It is used to log a message in
 * a {@link LogCallback} function.
 * @param message - The message template strings array.
 * @param values - The message template values.
 * @returns The rendered message array.
 */
export type LogTemplatePrefix = (
  message: TemplateStringsArray,
  ...values: unknown[]
) => unknown[];

/**
 * The severity level of a {@link LogRecord}.
 */
export type LogLevel = "debug" | "info" | "warning" | "error" | "fatal";

// eslint-disable-next-line ts/no-redeclare
export const LogLevel = {
  DEBUG: "debug" as LogLevel,
  INFO: "info" as LogLevel,
  WARNING: "warning" as LogLevel,
  ERROR: "error" as LogLevel,
  FATAL: "fatal" as LogLevel
};

/**
 * A log record.
 */
export interface LogRecord {
  /**
   * The log level.
   */
  readonly level: LogLevel;

  /**
   * The log message.  This is the result of substituting the message template
   * with the values.  The number of elements in this array is always odd,
   * with the message template values interleaved between the substitution
   * values.
   */
  readonly message: readonly unknown[];

  /**
   * The raw log message. This is the original message template without any further processing. It can be either:
   * - A string without any substitutions if the log record was created with a method call syntax, e.g., "Hello, \{name\}!" for logger.info("Hello, \{name\}!", \{ name \}).
   * - A template string array if the log record was created with a tagged template literal syntax, e.g., ["Hello, ", "!"] for logger.info\`Hello, $\{name\}!\`
   */
  readonly rawMessage: string | TemplateStringsArray;

  /**
   * The timestamp of the log record in milliseconds since the Unix epoch.
   */
  readonly timestamp: number;

  /**
   * The extra properties of the log record.
   */
  readonly properties: Record<string, unknown>;
}

/**
 * A sink is a function that accepts a log record and prints it somewhere.
 *
 * @param record - The log record to sink.
 */
export type LogSink = (record: LogRecord) => void;

/**
 * A filter is a function that accepts a log record and returns `true` if the
 * record should be passed to the sink.
 *
 * @param record - The log record to filter.
 * @returns `true` if the record should be passed to the sink.
 */
export type LogFilter = (record: LogRecord) => boolean;

/**
 * A filter-like value is either a {@link LogFilter} or a {@link LogLevel}.
 * `null` is also allowed to represent a filter that rejects all records.
 */
export type LogFilterLike = LogFilter | LogLevel | null;

/**
 * The formatted values for a log record.
 */
export interface FormattedValues {
  /**
   * The formatted timestamp.
   */
  timestamp: string;

  /**
   * The formatted log level.
   */
  level: string;

  /**
   * The formatted message.
   */
  message: string;

  /**
   * The unformatted log record.
   */
  record: LogRecord;
}

/**
 * A logger interface. It provides methods to log messages at different severity levels.
 *
 * @remarks
 * The inspiration and much of the original implementation for this logger was taken from the [LogTape](https://logtape.org/) project. Major thanks to that project.
 *
 * ```typescript
 * $storm.log.debug(`A debug message with ${value}.`);
 * $storm.log.info(`An info message with ${value}.`);
 * $storm.log.warn(`A warning message with ${value}.`);
 * $storm.log.error(`An error message with ${value}.`);
 * $storm.log.fatal(`A fatal error message with ${value}.`);
 * ```
 */
export interface IStormLog {
  /**
   * Get a logger with contextual properties. This is useful for log multiple messages with the shared set of properties.
   *
   * ```typescript
   * const ctx = $storm.log.with({ foo: 123, bar: "abc" });
   * ctx.info("A message with {foo} and {bar}.");
   * ctx.warn("Another message with {foo}, {bar}, and {baz}.", { baz: true });
   * ```
   *
   * The above code is equivalent to:
   *
   * ```typescript
   * $storm.log.info("A message with {foo} and {bar}.", { foo: 123, bar: "abc" });
   * $storm.log.warn(
   *   "Another message with {foo}, {bar}, and {baz}.",
   *   { foo: 123, bar: "abc", baz: true },
   * );
   * ```
   *
   * @param properties - The properties to add to the logger.
   * @returns A logger with the specified properties.
   */
  with: (properties: Record<string, unknown>) => IStormLog;

  /**
   * Log a debug message. Use this as a template string prefix.
   *
   * ```typescript
   * $storm.log.debug(`A debug message with ${value}.`);
   * ```
   *
   * @param message - The message template strings array.
   * @param values - The message template values.
   */
  debug: ((
    message: TemplateStringsArray,
    ...values: readonly unknown[]
  ) => void) &
    ((
      message: string,
      properties?: Record<string, unknown> | (() => Record<string, unknown>)
    ) => void) &
    ((callback: LogCallback) => void);

  /**
   * Log an informational message. Use this as a template string prefix.
   *
   * ```typescript
   * $storm.log.info(`An info message with ${value}.`);
   * ```
   *
   * @param message - The message template strings array.
   * @param values - The message template values.
   */
  info: ((
    message: TemplateStringsArray,
    ...values: readonly unknown[]
  ) => void) &
    ((
      message: string,
      properties?: Record<string, unknown> | (() => Record<string, unknown>)
    ) => void) &
    ((callback: LogCallback) => void);

  /**
   * Log a warning message. Use this as a template string prefix.
   *
   * ```typescript
   * $storm.log.warn(`A warning message with ${value}.`);
   * ```
   *
   * @param message - The message template strings array.
   * @param values - The message template values.
   */
  warn: ((
    message: TemplateStringsArray,
    ...values: readonly unknown[]
  ) => void) &
    ((
      message: string,
      properties?: Record<string, unknown> | (() => Record<string, unknown>)
    ) => void) &
    ((callback: LogCallback) => void);

  /**
   * Log an error message. Use this as a template string prefix.
   *
   * ```typescript
   * $storm.log.error(`An error message with ${value}.`);
   * ```
   *
   * @param message - The message template strings array.
   * @param values - The message template values.
   */
  error: ((
    message: TemplateStringsArray | Error,
    ...values: readonly unknown[]
  ) => void) &
    ((
      message: string,
      properties?: Record<string, unknown> | (() => Record<string, unknown>)
    ) => void) &
    ((callback: LogCallback) => void);

  /**
   * Log a fatal error message. Use this as a template string prefix.
   *
   * ```typescript
   * $storm.log.fatal(`A fatal error message with ${value}.`);
   * ```
   *
   * @param message - The message template strings array.
   * @param values - The message template values.
   */
  fatal: ((
    message: TemplateStringsArray | Error,
    ...values: readonly unknown[]
  ) => void) &
    ((
      message: string,
      properties?: Record<string, unknown> | (() => Record<string, unknown>)
    ) => void) &
    ((callback: LogCallback) => void);
}

export interface LogSinkInstance {
  /**
   * The log sink function.
   */
  handle: LogSink;

  /**
   * The lowest log level for the sink to accept.
   */
  logLevel: LogLevel;
}
