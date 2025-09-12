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
import { OTLPGRPCExporterConfigNode } from "@opentelemetry/otlp-grpc-exporter-base/build/src/types";
import type { LogRecordProcessor } from "@opentelemetry/sdk-logs";
import {
  LogPluginContext,
  LogPluginOptions,
  LogPluginResolvedOptions
} from "@storm-stack/devkit/types/plugins";
import { EnvPluginResolvedOptions } from "@storm-stack/plugin-env/types/plugin";

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
export type LogOpenTelemetryPluginOptions = LogPluginOptions & {
  /**
   * The OpenTelemetry logger provider to use.
   */
  loggerProvider?: ILoggerProvider;

  /**
   * The way to render the message in the log record.
   *
   * @remarks
   * If `"string"`, the message is rendered as a single string with the values are interpolated into the message. If `"array"`, the message is rendered as an array of strings. If any other string is provided, it is considered a {@link BodyFormatter} function name.
   *
   * @defaultValue "string"
   */
  messageType?: "string" | "array" | string;

  /**
   * Whether to log diagnostics.  Diagnostic logs are logged to
   * the `["storm", "meta", "otel"]` category.
   *
   * @defaultValue false
   */
  diagnostics?: boolean;

  /**
   * The service name to use. If not provided, the service name is taken from the `OTEL_SERVICE_NAME` environment variable.
   *
   * @remarks
   * Ignored if {@link LogOpenTelemetryPluginOptions.loggerProvider} is provided.
   */
  serviceName?: string;
} & (
    | ({
        exporter?: "http" | "proto";
      } & OTLPExporterNodeConfigBase)
    | ({
        exporter: "grpc";
      } & OTLPGRPCExporterConfigNode)
  );

export interface LogSentryPluginOptions extends LogPluginOptions {
  /**
   * The Sentry DSN to use for logging.
   *
   * @remarks
   * If not provided, the plugin will try to read the `SENTRY_DSN` environment variable.
   */
  dsn?: string;

  /**
   * Whether notification messages will be sent to Sentry.
   *
   * @remarks
   * If the current `mode` is set to "development", this value will be set to `false` automatically. This functionality can be overridden by manually setting this option to `true`.
   *
   * @defaultValue true
   */
  enabled?: boolean;
}

export type ResolvedLogOpenTelemetryPluginOptions = LogPluginResolvedOptions<
  Required<
    Pick<
      LogOpenTelemetryPluginOptions,
      "exporter" | "diagnostics" | "messageType" | "serviceName"
    >
  > &
    (
      | ({
          exporter: "http" | "proto";
        } & OTLPExporterNodeConfigBase)
      | ({
          exporter: "grpc";
        } & OTLPGRPCExporterConfigNode)
    )
>;

export type LogOpenTelemetryPluginResolvedOptions =
  ResolvedLogOpenTelemetryPluginOptions & EnvPluginResolvedOptions;

export type LogOpenTelemetryPluginContext<
  TOptions extends
    ResolvedLogOpenTelemetryPluginOptions = ResolvedLogOpenTelemetryPluginOptions
> = LogPluginContext<TOptions>;
