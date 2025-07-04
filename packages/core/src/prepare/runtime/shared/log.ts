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

import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context } from "../../../types/build";

export function writeLog(context: Context) {
  return `
/**
 * The log module provides a unified logging interface for Storm Stack applications.
 *
 * @module storm:log
 */

${getFileHeader()}
/* eslint-disable camelcase */

import {
  IStormLog,
  LogCallback,
  LogFilter,
  LogLevel,
  LogRecord,
  LogSink,
  LogSinkInstance
} from "@storm-stack/types/log";
import { StormError, isError, isStormError } from "./error";
${context.runtime.logs.map(log => log.import || `import ${log.name} from "./logs/${log.name}";`).join("\n")}

const LOG_LEVELS = [
  "debug",
  "info",
  "warning",
  "error",
  "fatal"
] as const;

/**
 * Returns a filter that accepts log records with the specified level.
 *
 * @param level - The level to filter by. If \`null\`, the filter will reject all records.
 * @returns The filter.
 */
export function getLevelFilter(level: LogLevel | null): LogFilter {
  if (level == null) {
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
 * The log sinks added by Storm Stack plugins.
 *
 * @remarks
 * This constant is generated dynamically by the build process. Do not modify it directly.
 */
const LOG_SINKS: LogSinkInstance[] = [
${context.runtime.logs.map(log => `{ logLevel: "${log.logLevel}", handle: ${log.name} }`).join(", \n")}
] as const;

/**
 * The StormLog class that's used for writing logs during Storm Stack applications.
 */
export class StormLog implements IStormLog {
  /**
   * The store in the global context
   *
   * @internal
   */
  #storage = {} as Record<string, unknown>;

  public readonly filters: LogFilter[];

  public lowestLogLevel: LogLevel | null =
    (process.env.LOG_LEVEL as LogLevel | null) ||
    $storm.config.LOG_LEVEL ||
    LogLevel.INFO;

  public constructor() {
    this.filters = [];
  }

  public with(properties: Record<string, unknown>): IStormLog {
    return new StormLogCtx(this, { ...properties });
  }

  public filter(record: LogRecord): boolean {
    for (const filter of this.filters) {
      if (!filter(record)) {
        return false;
      }
    }

    return true;
  }

  public *sinks(level?: LogLevel): Iterable<LogSink> {
    if (
      this.lowestLogLevel === null ||
      compareLogLevel(level || this.lowestLogLevel, this.lowestLogLevel) < 0
    ) {
      return;
    }

    for (const sink of LOG_SINKS.filter(
      sink =>
        compareLogLevel(level ?? this.lowestLogLevel ?? "info", sink.logLevel) <
        0
    ).map(sink => sink.handle)) {
      yield sink;
    }
  }

  public emit(record: LogRecord, bypassSinks?: Set<LogSink>): void {
    if (
      this.lowestLogLevel === null ||
      compareLogLevel(record.level, this.lowestLogLevel) < 0 ||
      !this.filter(record)
    ) {
      return;
    }

    for (const sink of this.sinks(record.level)) {
      if (!bypassSinks?.has(sink)) {
        try {
          sink(record);
        } catch (error) {
          const bypassSinks2 = new Set(bypassSinks);
          bypassSinks2.add(sink);

          console.error(
            \`Failed to emit a log record to sink \${sink.name}: \${(error as any)?.message || "Could not display error message"}\`
          );
        }
      }
    }
  }

  public log(
    level: LogLevel,
    rawMessage: string,
    properties: Record<string, unknown> | (() => Record<string, unknown>),
    bypassSinks?: Set<LogSink>
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
    this.emit(record, bypassSinks);
  }

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
      return [msg, rawMessage];
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

  public error(
    message: TemplateStringsArray | string | LogCallback | Error,
    ...values: unknown[]
  ): void {
    if (isStormError(message)) {
      this.log("error", message.toDisplay(), {
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

  public fatal(
    message: TemplateStringsArray | string | LogCallback | Error,
    ...values: unknown[]
  ): void {
    if (isStormError(message)) {
      this.log("fatal", message.toDisplay(), {
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

class StormLogCtx implements IStormLog {
  logger: StormLog;
  properties: Record<string, unknown>;

  constructor(logger: StormLog, properties: Record<string, unknown>) {
    this.logger = logger;
    this.properties = properties;
  }

  with(properties: Record<string, unknown>): IStormLog {
    return new StormLogCtx(this.logger, { ...this.properties, ...properties });
  }

  log(
    level: LogLevel,
    message: string,
    properties: Record<string, unknown> | (() => Record<string, unknown>),
    bypassSinks?: Set<LogSink>
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
      bypassSinks
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
      this.log("error", message.toDisplay(), {
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
      this.log("fatal", message.toDisplay(), {
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
