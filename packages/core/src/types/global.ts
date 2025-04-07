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

import type { TypeScriptBuildBaseEnv } from "@storm-software/build-tools/types";

export type StormEnv = {
  [TKey in Uppercase<string>]: TKey extends `STORM_${infer TBaseKey}`
    ? `STORM_${TBaseKey}` extends keyof TypeScriptBuildBaseEnv
      ? TypeScriptBuildBaseEnv[`STORM_${TBaseKey}`]
      : any
    : any;
} & {
  /**
   * The name of the application.
   */
  APP_NAME: string;

  /**
   * The unique identifier for the build.
   */
  BUILD_ID: string;

  /**
   * The timestamp the build was ran at.
   */
  BUILD_TIMESTAMP: number;

  /**
   * A checksum hash created during the build.
   */
  BUILD_CHECKSUM: string;

  /**
   * The unique identifier for the release.
   */
  RELEASE_ID: string;

  /**
   * The platform for which the application was built.
   *
   * @defaultValue "node"
   */
  PLATFORM: "node" | "browser" | "worker";

  /**
   * The mode in which the application is running.
   *
   * @defaultValue "production"
   */
  MODE: "development" | "staging" | "production";

  /**
   * Indicates if error stack traces should be captured.
   *
   * @defaultValue false
   */
  STACKTRACE: boolean;

  /**
   * Indicates if error data should be included.
   *
   * @defaultValue false
   */
  INCLUDE_ERROR_DATA: boolean;

  /**
   * The default timezone for the application.
   *
   * @defaultValue "America/New_York"
   */
  DEFAULT_TIMEZONE: string;

  /**
   * The default locale for the application.
   *
   * @defaultValue "en_US"
   */
  DEFAULT_LOCALE: string;

  /**
   * The default lowest log level to accept. If `null`, the logger will reject all records. This value only applies if `lowestLogLevel` is not provided to the `logs` configuration.
   *
   * @defaultValue "info"
   */
  LOG_LEVEL?: LogLevel | null;
};

export interface IStormRequest<TData = any> {
  /**
   * The timestamp of the request.
   */
  timestamp: number;

  /**
   * The unique identifier for the request.
   */
  id: string;

  /**
   * Any metadata associated with the request.
   */
  meta: Record<string, any>;

  /**
   * Any identifiers associated with the request.
   */
  identifiers?: Record<string, any>;

  /**
   * Any parameters associated with the request.
   */
  params?: Record<string, any>;

  /**
   * The payload of the request.
   */
  data: TData;
}
/**
 * A Storm response interface. It represents the structure of a response returned by the Storm Stack runtime.
 *
 * @remarks
 * The `IStormResponse` interface is used to standardize the structure of responses returned by the Storm Stack runtime.
 * It includes properties for the request ID, metadata, payload data, error information, timestamp, and success status.
 */
export interface IStormResponse<
  TData extends any | IStormError = any | IStormError
> {
  /**
   * The unique identifier for the request.
   */
  requestId: string;

  /**
   * Any metadata associated with the response.
   */
  meta: Record<string, any>;

  /**
   * The data of the response.
   */
  data: TData;

  /**
   * The timestamp of the response.
   */
  timestamp: number;

  /**
   * An indicator of whether the response was successful.
   */
  success: boolean;
}

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
 * $storm.log.debug`A debug message with ${value}.`;
 * $storm.log.info`An info message with ${value}.`;
 * $storm.log.warn`A warning message with ${value}.`;
 * $storm.log.error`An error message with ${value}.`;
 * $storm.log.fatal`A fatal error message with ${value}.`;
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
   * $storm.log.debug`A debug message with ${value}.`;
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
   * $storm.log.info`An info message with ${value}.`;
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
   * $storm.log.warn`A warning message with ${value}.`;
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
   * $storm.log.error`An error message with ${value}.`;
   * ```
   *
   * @param message - The message template strings array.
   * @param values - The message template values.
   */
  error: ((
    message: TemplateStringsArray,
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
   * $storm.log.fatal`A fatal error message with ${value}.`;
   * ```
   *
   * @param message - The message template strings array.
   * @param values - The message template values.
   */
  fatal: ((
    message: TemplateStringsArray,
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

/**
 * The type of error response message/event
 */
export enum ErrorType {
  GENERAL = "general",
  NOT_FOUND = "not_found",
  VALIDATION = "validation",
  SERVICE_UNAVAILABLE = "service_unavailable",
  ACTION_UNSUPPORTED = "action_unsupported",
  SECURITY = "security",
  UNKNOWN = "unknown"
}

/**
 * Interface representing the Storm error options.
 */
export interface StormErrorOptions {
  /**
   * The error name.
   */
  name?: string;

  /**
   * The error code
   */
  code: number;

  /**
   * The error message parameters.
   */
  params?: string[];

  /**
   * The error cause.
   */
  cause?: unknown;

  /**
   * The error stack.
   */
  stack?: string;

  /**
   * The type of error.
   *
   * @defaultValue "exception"
   */
  type?: ErrorType;

  /**
   * Additional data to be included with the error.
   */
  data: any;
}

export interface ParsedStacktrace {
  column?: number;
  function?: string;
  line?: number;
  source: string;
}

/**
 * The Storm Error interface.
 */
export interface IStormError extends Error {
  /**
   * The error code
   */
  code: number;

  /**
   * The error message parameters
   */
  params: string[];

  /**
   * The type of error that was thrown.
   */
  type?: ErrorType;

  /**
   * A url to display the error message
   */
  url: string;

  /**
   * Additional data to be passed with the error
   */
  data?: any;

  /**
   * The underlying cause of the error, if any. This is typically another error object that caused this error to be thrown.
   */
  cause: IStormError | undefined;

  /**
   * The parsed stacktrace
   */
  stacktrace: ParsedStacktrace[];

  /**
   * The original stacktrace
   */
  originalStack?: string;

  /**
   * Returns a formatted error string that can be displayed to the user.
   */
  toDisplay: () => string;

  /**
   * Internal function to inherit the error
   *
   * @internal
   */
  __proto__: any;
}
