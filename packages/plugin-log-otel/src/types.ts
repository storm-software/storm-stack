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

import type {
  AnyValue,
  LoggerProvider as LoggerProviderBase
} from "@opentelemetry/api-logs";
import type { OTLPExporterNodeConfigBase } from "@opentelemetry/otlp-exporter-base";
import type { LogRecordProcessor } from "@opentelemetry/sdk-logs";
import { StormConfigInterface } from "@storm-stack/types/shared/config";

/**
 * The OpenTelemetry logger provider.
 */
export type ILoggerProvider = LoggerProviderBase & {
  /**
   * Adds a new {@link LogRecordProcessor} to this logger.
   *
   * @param processor - the new LogRecordProcessor to be added.
   */
  addLogRecordProcessor: (processor: LogRecordProcessor) => void;

  /**
   * Flush all buffered data and shut down the LoggerProvider and all registered
   * LogRecordProcessor.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  shutdown?: () => Promise<void>;
};

/**
 * The way to render the object in the log record.  If `"json"`,
 * the object is rendered as a JSON string.  If `"inspect"`,
 * the object is rendered using `util.inspect` in Node.js/Bun, or
 * `Deno.inspect` in Deno.
 */
export type ObjectRenderer = "json" | "inspect";

export type Message = (string | null | undefined)[];

/**
 * Custom `body` attribute formatter.
 */
export type BodyFormatter = (message: Message) => AnyValue;

/**
 * Options for creating an OpenTelemetry adapter.
 */
export interface OpenTelemetryAdapterOptions {
  /**
   * The OpenTelemetry logger provider to use.
   */
  loggerProvider?: ILoggerProvider;

  /**
   * The way to render the message in the log record.  If `"string"`,
   * the message is rendered as a single string with the values are
   * interpolated into the message.  If `"array"`, the message is
   * rendered as an array of strings.  `"string"` by default.
   *
   * Or even fully customizable with a {@link BodyFormatter} function.
   */
  messageType?: "string" | "array" | BodyFormatter;

  /**
   * The way to render the object in the log record.  If `"json"`,
   * the object is rendered as a JSON string.  If `"inspect"`,
   * the object is rendered using `util.inspect` in Node.js/Bun, or
   * `Deno.inspect` in Deno.  `"inspect"` by default.
   */
  objectRenderer?: ObjectRenderer;

  /**
   * Whether to log diagnostics.  Diagnostic logs are logged to
   * the `["storm", "meta", "otel"]` category.
   * Turned off by default.
   */
  diagnostics?: boolean;

  /**
   * The OpenTelemetry OTLP exporter configuration to use.
   * Ignored if `loggerProvider` is provided.
   */
  otlpExporterConfig?: OTLPExporterNodeConfigBase;

  /**
   * The service name to use.  If not provided, the service name is
   * taken from the `OTEL_SERVICE_NAME` environment variable.
   * Ignored if `loggerProvider` is provided.
   */
  serviceName?: string;
}

export interface StormOpenTelemetryLogConfig extends StormConfigInterface {
  /**
   * The name of the OpenTelemetry service to use.
   *
   * @remarks
   * If not provided, the service name is taken from the `APP_NAME` environment variable.
   */
  OTEL_SERVICE_NAME?: string;
}
