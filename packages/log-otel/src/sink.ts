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
  AnyValue,
  LogRecord as OTLogRecord
} from "@opentelemetry/api-logs";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  LoggerProvider,
  SimpleLogRecordProcessor
} from "@opentelemetry/sdk-logs";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import type { LogRecord, LogSink } from "storm-stack/types";
import type {
  BodyFormatter,
  ILoggerProvider,
  ObjectRenderer,
  OpenTelemetrySinkOptions
} from "./types";

/**
 * Creates a sink that forwards log records to OpenTelemetry.
 * @param options Options for creating the sink.
 * @returns The sink.
 */
export function getOpenTelemetrySink(
  options: OpenTelemetrySinkOptions = {}
): LogSink {
  // if (options.diagnostics) {
  //   diag.setLogger(new DiagLoggerAdaptor(), DiagLogLevel.DEBUG);
  // }

  let loggerProvider: ILoggerProvider;
  if (options.loggerProvider == null) {
    // eslint-disable-next-line ts/no-unsafe-call
    const resource = Resource.default().merge(
      // eslint-disable-next-line ts/no-unsafe-call
      new Resource({
        [ATTR_SERVICE_NAME]:
          process.env.APP_NAME ||
          process.env.NAME ||
          process.env.OTEL_SERVICE_NAME ||
          "storm"
      })
    );

    loggerProvider = new LoggerProvider({ resource });
    // eslint-disable-next-line ts/no-unsafe-call
    const otlpExporter = new OTLPLogExporter(options.otlpExporterConfig);
    // eslint-disable-next-line ts/no-unsafe-call
    loggerProvider.addLogRecordProcessor(
      // @ts-ignore: it works anyway...
      new SimpleLogRecordProcessor(otlpExporter)
    );
  } else {
    loggerProvider = options.loggerProvider;
  }

  const objectRenderer = options.objectRenderer ?? "inspect";
  // eslint-disable-next-line ts/no-unsafe-call
  const logger = loggerProvider.getLogger(
    process.env.STORM_APP_NAME!,
    process.env.STORM_APP_VERSION!
  );
  const sink = (record: LogRecord) => {
    const { level, message, timestamp, properties } = record;

    const severityNumber = mapLevelToSeverityNumber(level);
    const attributes = convertToAttributes(properties, objectRenderer);

    // eslint-disable-next-line ts/no-unsafe-call
    logger.emit({
      severityNumber,
      severityText: level,
      body:
        typeof options.messageType === "function"
          ? convertMessageToCustomBodyFormat(
              message,
              objectRenderer,
              options.messageType
            )
          : options.messageType === "array"
            ? convertMessageToArray(message, objectRenderer)
            : convertMessageToString(message, objectRenderer),
      attributes,
      timestamp: new Date(timestamp)
    } satisfies OTLogRecord);
  };

  if (loggerProvider.shutdown != null) {
    // eslint-disable-next-line ts/no-unsafe-call
    const shutdown = loggerProvider.shutdown.bind(loggerProvider);
    sink[Symbol.asyncDispose] = shutdown;
  }

  return sink;
}

function mapLevelToSeverityNumber(level: string): number {
  switch (level) {
    case "debug":
      return SeverityNumber.DEBUG;
    case "info":
      return SeverityNumber.INFO;
    case "warning":
      return SeverityNumber.WARN;
    case "error":
      return SeverityNumber.ERROR;
    case "fatal":
      return SeverityNumber.FATAL;
    default:
      return SeverityNumber.UNSPECIFIED;
  }
}

function convertToAttributes(
  properties: Record<string, unknown>,
  objectRenderer: ObjectRenderer
): Record<string, AnyValue> {
  const attributes: Record<string, AnyValue> = {};
  for (const [name, value] of Object.entries(properties)) {
    const key = `attributes.${name}`;
    if (value == null) continue;
    if (Array.isArray(value)) {
      let t = null;
      for (const v of value) {
        if (v == null) continue;
        // eslint-disable-next-line valid-typeof
        if (t != null && typeof v !== t) {
          attributes[key] = value.map(v => convertToString(v, objectRenderer));
          break;
        }
        t = typeof v;
      }
      attributes[key] = value;
    } else {
      const encoded = convertToString(value, objectRenderer);
      if (encoded == null) continue;
      attributes[key] = encoded;
    }
  }
  return attributes;
}

function convertToString(
  value: unknown,
  objectRenderer: ObjectRenderer
): string | null | undefined {
  if (value === null || value === undefined || typeof value === "string") {
    return value;
  } else if (objectRenderer === "inspect") {
    // eslint-disable-next-line ts/no-use-before-define
    return inspect(value);
  } else if (typeof value === "number" || typeof value === "boolean") {
    return value.toString();
  } else if (value instanceof Date) {
    return value.toISOString();
  } else {
    return JSON.stringify(value);
  }
}

function convertMessageToArray(
  message: readonly unknown[],
  objectRenderer: ObjectRenderer
): AnyValue {
  const body: (string | null | undefined)[] = [];
  for (let i = 0; i < message.length; i += 2) {
    const msg = message[i] as string;
    body.push(msg);
    if (message.length <= i + 1) break;
    const val = message[i + 1];
    body.push(convertToString(val, objectRenderer));
  }
  return body;
}

function convertMessageToString(
  message: readonly unknown[],
  objectRenderer: ObjectRenderer
): AnyValue {
  let body = "";
  for (let i = 0; i < message.length; i += 2) {
    const msg = message[i] as string;
    body += msg;
    if (message.length <= i + 1) break;
    const val = message[i + 1];
    const extra = convertToString(val, objectRenderer);
    body += extra ?? JSON.stringify(extra);
  }
  return body;
}

function convertMessageToCustomBodyFormat(
  message: readonly unknown[],
  objectRenderer: ObjectRenderer,
  bodyFormatter: BodyFormatter
): AnyValue {
  const body = message.map(msg => convertToString(msg, objectRenderer));

  return bodyFormatter(body);
}

/**
 * A platform-specific inspect function.  In Deno, this is {@link Deno.inspect},
 * and in Node.js/Bun it is {@link util.inspect}.  If neither is available, it
 * falls back to {@link JSON.stringify}.
 *
 * @param value The value to inspect.
 * @returns The string representation of the value.
 */
const inspect: (value: unknown) => string =
  // @ts-ignore: Deno global
  // dnt-shim-ignore
  "Deno" in globalThis &&
  // @ts-ignore: Deno global
  // dnt-shim-ignore
  "inspect" in globalThis.Deno &&
  // @ts-ignore: Deno global
  typeof globalThis.Deno.inspect === "function"
    ? // @ts-ignore: Deno global
      globalThis.Deno.inspect
    : // @ts-ignore: Node.js global
      "util" in globalThis &&
        // @ts-ignore: util global
        // dnt-shim-ignore
        "inspect" in globalThis.util &&
        // @ts-ignore: Node.js global
        globalThis.util.inspect === "function"
      ? // @ts-ignore: Node.js global
        globalThis.util.inspect
      : JSON.stringify;

// class DiagLoggerAdaptor implements DiagLogger {
//   logger: IStormLog;

//   constructor() {
//     this.logger = getStormLog(["storm", "meta", "otel"]);
//   }

//   #escape(msg: string): string {
//     return msg.replaceAll("{", "{{").replaceAll("}", "}}");
//   }

//   error(msg: string, ...values: unknown[]): void {
//     this.logger.error(`${this.#escape(msg)}: {values}`, { values });
//   }

//   warn(msg: string, ...values: unknown[]): void {
//     this.logger.warn(`${this.#escape(msg)}: {values}`, { values });
//   }

//   info(msg: string, ...values: unknown[]): void {
//     this.logger.info(`${this.#escape(msg)}: {values}`, { values });
//   }

//   debug(msg: string, ...values: unknown[]): void {
//     this.logger.debug(`${this.#escape(msg)}: {values}`, { values });
//   }

//   verbose(msg: string, ...values: unknown[]): void {
//     this.logger.debug(`${this.#escape(msg)}: {values}`, { values });
//   }
// }
