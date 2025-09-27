/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import type { Context } from "@storm-stack/core/types/context";
import { pascalCase } from "@stryke/string-format/pascal-case";

/**
 * The log module provides a unified logging interface for Storm Stack applications.
 *
 * @param context - The context of the Storm Stack runtime, which includes logging configurations.
 * @returns A string representing the log module code.
 */
export function LogModule(context: Context) {
  return `
/**
 * The log module provides a unified logging interface for Storm Stack applications.
 *
 * @module storm:log
 */

${getFileHeader()}
/* eslint-disable camelcase */

import {
  StormLogInterface,
  LogCallback,
  LogFilter,
  LogLevel,
  LogRecord,
  LogAdapter,
  LogAdapterInstance
} from "@storm-stack/core/runtime-types/shared/log";
import { StormError, isError, isStormError } from "storm:error";
${context.runtime.logs
  .map(
    log =>
      `import create${pascalCase(log.namespace)}LogAdapter from "storm:${log.fileName}";`
  )
  .filter(Boolean)
  .join("\n")}

const LOG_LEVELS = [
  "debug",
  "info",
  "warning",
  "error",
  "fatal"
];

/**
 * Returns a filter that accepts log records with the specified level.
 *
 * @param level - The level to filter by. If \`null\`, the filter will reject all records.
 * @returns The filter.
 */
export function getLevelFilter(level: LogLevel | null): LogFilter {
  if (!level) {
    return () => false;
  } else if (level === "fatal") {
    return (record: LogRecord) => record.level === "fatal";
  } else if (level === "error") {
    return (record: LogRecord) =>
      record.level === "fatal" || record.level === "error";
  } else if (level === "warning") {
    return (record: LogRecord) =>
      record.level === "fatal" ||
      record.level === "error" ||
      record.level === "warning";
  } else if (level === "info") {
    return (record: LogRecord) =>
      record.level === "fatal" ||
      record.level === "error" ||
      record.level === "warning" ||
      record.level === "info";
  } else if (level === "debug") {
    return () => true;
  }

  throw new StormError({ type: "general", code: 11, params: [String(level)] });
}

/**
 * Parses a {@link LogLevel | log level} from a string.
 *
 * @param level - The {@link LogLevel | log level} as a string. This is case-insensitive.
 * @returns The {@link LogLevel | log level}.
 */
export function parseLogLevel(level: string): LogLevel {
  const formattedLevel = level.toLowerCase();

  switch (formattedLevel) {
    case "debug":
    case "info":
    case "warning":
    case "error":
    case "fatal":
      return formattedLevel;
    default:
      throw new StormError({ type: "general", code: 11, params: [String(level)] });
  }
}

/**
 * Checks if a string is a valid {@link LogLevel | log level}. This function can be used as a type guard to narrow the type of a string to a {@link LogLevel}.
 *
 * @param level - The {@link LogLevel | log level} as a string. This is case-sensitive.
 * @returns \`true\` if the string is a valid {@link LogLevel | log level}.
 */
export function isLogLevel(level: string): level is LogLevel {
  switch (level) {
    case "debug":
    case "info":
    case "warning":
    case "error":
    case "fatal":
      return true;
    default:
      return false;
  }
}

/**
 * Compares two {@link LogLevel | log levels}.
 *
 * @param a - The first {@link LogLevel | log level}.
 * @param b - The second {@link LogLevel | log level}.
 * @returns A negative number if \`a\` is less than \`b\`, a positive number if \`a\` is greater than \`b\`, or zero if they are equal.
 */
function compareLogLevel(a: LogLevel, b: LogLevel): number {
  const aIndex = LOG_LEVELS.indexOf(a);
  if (aIndex < 0) {
    throw new StormError({ type: "general", code: 11, params: [String(a)] });
  }
  const bIndex = LOG_LEVELS.indexOf(b);
  if (bIndex < 0) {
    throw new StormError({ type: "general", code: 11, params: [String(b)] });
  }
  return aIndex - bIndex;
}

/**
 * Parse a message template into a message template array and a values array.
 *
 * @param template - The message template.
 * @param properties - The values to replace placeholders with.
 * @returns The message template array and the values array.
 */
function parseMessageTemplate(
  template: string,
  properties: Record<string, unknown>
): readonly unknown[] {
  const message: unknown[] = [];
  let part = "";
  for (let i = 0; i < template.length; i++) {
    const char = template.charAt(i);
    const nextChar = template.charAt(i + 1);

    if (char === "{" && nextChar === "{") {
      // Escaped { character
      part += char;
      i++;
    } else if (char === "}" && nextChar === "}") {
      // Escaped } character
      part += char;
      i++;
    } else if (char === "{") {
      // Start of a placeholder
      message.push(part);
      part = "";
    } else if (char === "}") {
      // End of a placeholder
      let prop: unknown;
      if (part.match(/^\s|\s$/)) {
        prop = part in properties ? properties[part] : properties[part.trim()];
      } else {
        prop = properties[part];
      }
      message.push(prop);
      part = "";
    } else {
      // Default case
      part += char;
    }
  }
  message.push(part);
  return message;
}

/**
 * Render a message template with values.
 *
 * @param template - The message template.
 * @param values - The message template values.
 * @returns The message template values interleaved between the substitution values.
 */
function renderMessage(
  template: TemplateStringsArray,
  values: readonly unknown[]
): unknown[] {
  const args = [] as unknown[];
  for (let i = 0; i < template.length; i++) {
    if (template[i]) {
      args.push(template[i]);
      if (i < values.length && values[i]) {
        args.push(values[i]);
      }
    }
  }

  return args;
}

/**
 * The StormLog class that's used for writing logs during Storm Stack applications.
 */
export class StormLog implements StormLogInterface {
  /**
   * The store in the global context
   *
   * @internal
   */
  #storage = {} as Record<string, unknown>;

  /**
   * The log adapters added by Storm Stack plugins.
   *
   * @remarks
   * This constant is generated dynamically by the build process. Do not modify it directly.
   */
  #adapters = [] as LogAdapterInstance[];

  /**
   * The list of filters applied to log records.
   *
   * @remarks
   * Filters are functions that take a {@link LogRecord} and return a boolean indicating whether the record should be logged. You can add custom filters to this list to control which log records are emitted.
   */
  public readonly filters: LogFilter[];

  /**
   * The lowest log level that will be logged by this logger.
   *
   * @remarks
   * This is set to the value of the \`LOG_LEVEL\` configuration parameter.
   *
   * @defaultValue "info"
   */
  public lowestLogLevel: LogLevel | null = $storm.env.LOG_LEVEL ?? "info";

  /**
   * Create a new StormLog instance.
   *
   * @remarks
   * This constructor initializes the logger with an empty filter list and sets the lowest log level to \`null\`.
   */
  public constructor() {
    ${context.runtime.logs
      .map(
        log =>
          `this.#adapters.push({ logLevel: "${log.logLevel}", handle: create${pascalCase(log.namespace)}LogAdapter });`
      )
      .filter(Boolean)
      .join("\n")}

    this.filters = [];
  }

  /**
   * Generates a new {@link StormLogCtx} instance and adds properties to the logger context.
   *
   * @remarks
   * This method allows you to create a new logger context with additional properties. The properties will be merged with the existing properties in the logger context.
   *
   * @param properties - The properties to add to the logger context.
   * @returns A new {@link StormLogCtx} instance with the merged properties.
   */
  public with(properties: Record<string, unknown>): StormLogInterface {
    return new StormLogCtx(this, { ...properties });
  }

  /**
   * Filters log records based on the logger's filters.
   *
   * @param record - The log record to filter.
   * @returns Whether the log record passes all filters.
   */
  public filter(record: LogRecord): boolean {
    for (const filter of this.filters) {
      if (!filter(record)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns an async iterable of log adapters that match the specified log level.
   *
   * @param level - The log level to filter adapters by.
   * @returns An iterable of log adapters that match the specified log level.
   */
  public *adapters(level?: LogLevel): Iterable<LogAdapter> {
    if (
      this.lowestLogLevel === null ||
      compareLogLevel(level || this.lowestLogLevel, this.lowestLogLevel) < 0
    ) {
      return;
    }

    for (const adapter of this.#adapters.filter(
      adapter =>
        compareLogLevel(level ?? this.lowestLogLevel ?? "info", adapter.logLevel) <
        0
    ).map(adapter => adapter.handle)) {
      yield adapter;
    }
  }

  /**
   * Emits a log record to all registered adapters that match the record's log level.
   *
   * @param record - The log record to emit.
   * @param bypassAdapters - A set of adapters to bypass when emitting the record.
   */
  public emit(record: LogRecord, bypassAdapters?: Set<LogAdapter>): void {
    if (
      this.lowestLogLevel === null ||
      compareLogLevel(record.level, this.lowestLogLevel) < 0 ||
      !this.filter(record)
    ) {
      return;
    }

    for (const adapter of this.adapters(record.level)) {
      if (!bypassAdapters?.has(adapter)) {
        try {
          adapter(record);
        } catch (error) {
          const bypassAdapters2 = new Set(bypassAdapters);
          bypassAdapters2.add(adapter);

          console.error(
            \`Failed to emit a log record to adapter \${adapter.name}: \${(error as any)?.message || "Could not display error message"}\`
          );
        }
      }
    }
  }

  /**
   * Logs a message at the specified log level.
   *
   * @param level - The log level to use.
   * @param rawMessage - The raw message to log.
   * @param properties - The properties to include with the log message.
   * @param bypassAdapters - A set of adapters to bypass when emitting the log message.
   */
  public log(
    level: LogLevel,
    rawMessage: string,
    properties: Record<string, unknown> | (() => Record<string, unknown>),
    bypassAdapters?: Set<LogAdapter>
  ): void {
    const implicitContext = this.getStore();
    let cachedProps: Record<string, unknown> | undefined;
    const record: LogRecord =
      typeof properties === "function"
        ? {
            level,
            timestamp: Date.now(),
            get message() {
              return parseMessageTemplate(rawMessage, this.properties);
            },
            rawMessage,
            get properties() {
              cachedProps ??= {
                ...implicitContext,
                ...properties()
              };
              return cachedProps;
            }
          }
        : {
            level,
            timestamp: Date.now(),
            message: parseMessageTemplate(rawMessage, {
              ...implicitContext,
              ...properties
            }),
            rawMessage,
            properties: { ...implicitContext, ...properties }
          };
    this.emit(record, bypassAdapters);
  }

  /**
   * Logs a message lazily at the specified log level.
   *
   * @param level - The log level to use.
   * @param callback - A callback function that returns the message to log.
   * @param properties - The properties to include with the log message.
   */
  public logLazily(
    level: LogLevel,
    callback: LogCallback,
    properties: Record<string, unknown> = {}
  ): void {
    const implicitContext = this.getStore();
    let rawMessage: TemplateStringsArray | undefined;
    let msg: unknown[] | undefined;
    function realizeMessage(): [unknown[], TemplateStringsArray] {
      if (msg == null || rawMessage == null) {
        msg = callback((tpl, ...values) => {
          rawMessage = tpl;
          return renderMessage(tpl, values);
        });
        if (rawMessage == null) {
          throw new StormError({ type: "general", code: 10 });
        }
      }

      return [msg ?? [], rawMessage];
    }
    this.emit({
      level,
      get message() {
        return realizeMessage()[0];
      },
      get rawMessage() {
        return realizeMessage()[1];
      },
      timestamp: Date.now(),
      properties: { ...implicitContext, ...properties }
    });
  }

  /**
   * Logs a message template at the specified log level.
   *
   * @param level - The log level to use.
   * @param messageTemplate - The message template to log.
   * @param values - The values to interpolate into the message template.
   * @param properties - The properties to include with the log message.
   */
  public logTemplate(
    level: LogLevel,
    messageTemplate: TemplateStringsArray,
    values: unknown[],
    properties: Record<string, unknown> = {}
  ): void {
    const implicitContext = this.getStore();
    this.emit({
      level,
      message: renderMessage(messageTemplate, values),
      rawMessage: messageTemplate,
      timestamp: Date.now(),
      properties: { ...implicitContext, ...properties }
    });
  }

  /**
   * Logs a debug message.
   *
   * @param message - The message to log. Can be a string, a template string, or a callback function that returns the message.
   * @param values - The values to interpolate into the message template.
   */
  public debug(
    message: TemplateStringsArray | string | LogCallback,
    ...values: unknown[]
  ): void {
    if (typeof message === "string") {
      this.log("debug", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("debug", message);
    } else {
      this.logTemplate("debug", message, values);
    }
  }

  /**
   * Logs an info message.
   *
   * @param message - The message to log. Can be a string, a template string, or a callback function that returns the message.
   * @param values - The values to interpolate into the message template.
   */
  public info(
    message: TemplateStringsArray | string | LogCallback,
    ...values: unknown[]
  ): void {
    if (typeof message === "string") {
      this.log("info", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("info", message);
    } else {
      this.logTemplate("info", message, values);
    }
  }

  /**
   * Logs a warning message.
   *
   * @param message - The message to log. Can be a string, a template string, or a callback function that returns the message.
   * @param values - The values to interpolate into the message template.
   */
  public warn(
    message: TemplateStringsArray | string | LogCallback,
    ...values: unknown[]
  ): void {
    if (typeof message === "string") {
      this.log(
        "warning",
        message,
        (values[0] ?? {}) as Record<string, unknown>
      );
    } else if (typeof message === "function") {
      this.logLazily("warning", message);
    } else {
      this.logTemplate("warning", message, values);
    }
  }

  /**
   * Logs an error message.
   *
   * @param message - The message to log. Can be a string, a template string, or a callback function that returns the message.
   * @param values - The values to interpolate into the message template.
   */
  public error(
    message: TemplateStringsArray | string | LogCallback | Error,
    ...values: unknown[]
  ): void {
    if (isStormError(message)) {
      this.log("error", message.toString(), {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (isError(message)) {
      this.log("error", message.message, {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (typeof message === "string") {
      this.log("error", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("error", message);
    } else {
      this.logTemplate("error", message, values);
    }
  }

  /**
   * Logs a fatal message.
   *
   * @param message - The message to log. Can be a string, a template string, or a callback function that returns the message.
   * @param values - The values to interpolate into the message template.
   */
  public fatal(
    message: TemplateStringsArray | string | LogCallback | Error,
    ...values: unknown[]
  ): void {
    if (isStormError(message)) {
      this.log("fatal", message.toString(), {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (isError(message)) {
      this.log("fatal", message.message, {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (typeof message === "string") {
      this.log("fatal", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("fatal", message);
    } else {
      this.logTemplate("fatal", message, values);
    }
  }

  protected getStore(): Record<string, unknown> {
    return this.#storage;
  }
}

class StormLogCtx implements StormLogInterface {
  logger: StormLog;
  properties: Record<string, unknown>;

  constructor(logger: StormLog, properties: Record<string, unknown>) {
    this.logger = logger;
    this.properties = properties;
  }

  with(properties: Record<string, unknown>): StormLogInterface {
    return new StormLogCtx(this.logger, { ...this.properties, ...properties });
  }

  log(
    level: LogLevel,
    message: string,
    properties: Record<string, unknown> | (() => Record<string, unknown>),
    bypassAdapters?: Set<LogAdapter>
  ): void {
    this.logger.log(
      level,
      message,
      typeof properties === "function"
        ? () => ({
            ...this.properties,
            ...properties()
          })
        : { ...this.properties, ...properties },
      bypassAdapters
    );
  }

  logLazily(level: LogLevel, callback: LogCallback): void {
    this.logger.logLazily(level, callback, this.properties);
  }

  logTemplate(
    level: LogLevel,
    messageTemplate: TemplateStringsArray,
    values: unknown[]
  ): void {
    this.logger.logTemplate(level, messageTemplate, values, this.properties);
  }

  debug(
    message: TemplateStringsArray | string | LogCallback,
    ...values: unknown[]
  ): void {
    if (typeof message === "string") {
      this.log("debug", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("debug", message);
    } else {
      this.logTemplate("debug", message, values);
    }
  }

  info(
    message: TemplateStringsArray | string | LogCallback,
    ...values: unknown[]
  ): void {
    if (typeof message === "string") {
      this.log("info", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("info", message);
    } else {
      this.logTemplate("info", message, values);
    }
  }

  warn(
    message: TemplateStringsArray | string | LogCallback,
    ...values: unknown[]
  ): void {
    if (typeof message === "string") {
      this.log(
        "warning",
        message,
        (values[0] ?? {}) as Record<string, unknown>
      );
    } else if (typeof message === "function") {
      this.logLazily("warning", message);
    } else {
      this.logTemplate("warning", message, values);
    }
  }

  error(
    message: TemplateStringsArray | string | LogCallback | Error,
    ...values: unknown[]
  ): void {
    if (isStormError(message)) {
      this.log("error", message.toString(), {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (isError(message)) {
      this.log("error", message.message, {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (typeof message === "string") {
      this.log("error", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("error", message);
    } else {
      this.logTemplate("error", message, values);
    }
  }

  fatal(
    message: TemplateStringsArray | string | LogCallback | Error,
    ...values: unknown[]
  ): void {
    if (isStormError(message)) {
      this.log("fatal", message.toString(), {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (isError(message)) {
      this.log("fatal", message.message, {
        error: message,
        ...((values[0] ?? {}) as Record<string, unknown>)
      });
    } else if (typeof message === "string") {
      this.log("fatal", message, (values[0] ?? {}) as Record<string, unknown>);
    } else if (typeof message === "function") {
      this.logLazily("fatal", message);
    } else {
      this.logTemplate("fatal", message, values);
    }
  }
}

`;
}
