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

import type { OTLPExporterNodeConfigBase } from "@opentelemetry/otlp-exporter-base";
import type { OTLPGRPCExporterConfigNode } from "@opentelemetry/otlp-grpc-exporter-base";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getFileHeader } from "@storm-stack/core/lib/utilities";
import type { Context } from "@storm-stack/core/types";
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import type { LogPluginOptions } from "@storm-stack/devkit/plugins/log";
import LogPlugin from "@storm-stack/devkit/plugins/log";
import { StormJSON } from "@stryke/json/storm-json";

export type LogOpenTelemetryPluginConfig = LogPluginOptions & {
  serviceName?: string;
  messageType?: "string" | "array" | string;
} & (
    | ({
        exporter?: "http" | "proto";
      } & OTLPExporterNodeConfigBase)
    | ({
        exporter: "grpc";
      } & OTLPGRPCExporterConfigNode)
  );

/**
 * A Storm Stack plugin for OpenTelemetry logging.
 */
export default class LogOpenTelemetryPlugin extends LogPlugin<LogOpenTelemetryPluginConfig> {
  protected override packageDeps = {
    "@opentelemetry/api-logs@^0.200.0": "dependency",
    "@opentelemetry/resources@^0.200.0": "dependency",
    "@opentelemetry/sdk-logs@^0.200.0": "dependency",
    "@opentelemetry/semantic-conventions@^1.32.0": "dependency"
  } as Record<string, "dependency" | "devDependency">;

  public constructor(options: PluginOptions<LogOpenTelemetryPluginConfig>) {
    super(options);

    this.options.exporter ??= "http";
    if (this.options.exporter === "grpc") {
      this.log(
        LogLevelLabel.WARN,
        "Usage of the OpenTelemetry gRPC exporter is still in active development."
      );
    }

    this.packageDeps[
      `@opentelemetry/exporter-logs-otlp-${this.options.exporter}@^0.200.0`
    ] = "dependency";
  }

  protected override writeAdapter(_context: Context) {
    return `${getFileHeader()}

import type {
  AnyValue,
  LogRecord as OTLogRecord
} from "@opentelemetry/api-logs";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-${
      this.options.exporter
    }";
import type { DetectedResourceAttributes } from "@opentelemetry/resources";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  LoggerProvider,
  SimpleLogRecordProcessor
} from "@opentelemetry/sdk-logs";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { LogRecord, LogAdapter } from "@storm-stack/types/shared/log";
import { StormJSON } from "@stryke/json/storm-json";
import {
  BodyFormatter,
  ILoggerProvider,
  ObjectRenderer,
  OpenTelemetryAdapterOptions
} from "@storm-stack/plugin-log-otel/types";

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
    const key = \`attributes.\${name}\`;
    if (value == null) continue;
    if (Array.isArray(value)) {
      let t: string | null = null;
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
    return StormJSON.stringify(value);
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
    body += extra ?? StormJSON.stringify(extra);
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
 * A platform-specific inspect function. In Deno, this is {@link Deno.inspect}, and in Node.js/Bun it is {@link util.inspect}. If neither is available, it falls back to {@link StormJSON.stringify}.
 *
 * @param value - The value to inspect.
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
      : // eslint-disable-next-line ts/unbound-method
        StormJSON.stringify;

/**
 * Creates a new [OpenTelemetry](https://opentelemetry.io/) logging adapter.
 *
 * @returns The created logging adapter.
 */
function createAdapter(): LogAdapter {
  const SERVICE_NAME =
    ${this.options.serviceName} || $storm.config.OTEL_SERVICE_NAME || $storm.env.name;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: SERVICE_NAME
  } as DetectedResourceAttributes);

  const loggerProvider = new LoggerProvider({ resource });
  loggerProvider.addLogRecordProcessor(
    new SimpleLogRecordProcessor(
      new OTLPLogExporter({
          url: "${this.options.url}",
          headers: ${StormJSON.stringify(this.options.headers)},
          concurrencyLimit: ${this.options.concurrencyLimit ?? 10},
          timeoutMillis: ${this.options.timeoutMillis ?? 10000},
          compression: "${this.options.compression}"
        })
    )
  );

  const logger = loggerProvider.getLogger(
    SERVICE_NAME,
    $storm.env.version
  );

  const adapter = (record: LogRecord) => {
    const { level, message, timestamp, properties } = record;

    const severityNumber = mapLevelToSeverityNumber(level);
    const attributes = convertToAttributes(properties, inspect);

    logger.emit({
      severityNumber,
      severityText: level,
      body: ${
        this.options.messageType === "string"
          ? `convertMessageToString(message, inspect)`
          : this.options.messageType === "array"
            ? `convertMessageToArray(message, inspect)`
            : `convertMessageToCustomBodyFormat(
              message,
              inspect,
              ${this.options.messageType}
            )`
      },
      attributes,
      timestamp: new Date(timestamp)
    } satisfies OTLogRecord);
  };

  if (loggerProvider.shutdown != null) {
    adapter[Symbol.asyncDispose] = loggerProvider.shutdown.bind(loggerProvider);
  }

  return adapter;
}

export default createAdapter;

`;
  }
}
