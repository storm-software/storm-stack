/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { Context, Span, SpanKind, SpanOptions } from "@opentelemetry/api";
import { api } from "@opentelemetry/sdk-node";
import type { StormConfig } from "@storm-software/config";
import { StormError } from "@storm-stack/errors/storm-error";
import { StormLog } from "@storm-stack/logging/storm-log";
import { uuid } from "@storm-stack/unique-identifier/uuid";
import type pino from "pino";
import { TelemetryErrorCode } from "./errors";
import { initOtel } from "./otel/init";
import { initSentry } from "./sentry/init";
import type { TelemetryConfig } from "./types";

/**
 * The default Storm-Stack telemetry class, responsible for logging and tracing system processing.
 *
 * @remarks
 * This logger writes to stdio and to a file and/or [Loki streams](https://grafana.com/oss/loki/).
 */
export class StormTrace extends StormLog {
  static #tracer: api.Tracer;

  /**
   * Initialize the logger.
   *
   * @param config - The Storm config
   * @param name - The name of the service to initialized the loggers for
   * @returns The initialized loggers
   */
  public static override initialize = (
    config: StormConfig<"telemetry", TelemetryConfig>,
    name?: string,
    streams: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[] = []
  ) => {
    if (!name && !config.extensions.telemetry?.serviceName) {
      throw StormError.create(TelemetryErrorCode.missing_service_name);
    }

    const serviceName = name || config.extensions.telemetry?.serviceName;

    initOtel({
      serviceName,
      serviceVersion: config.extensions.telemetry?.serviceVersion
    });
    initSentry({
      dsn: "",
      serviceName,
      serviceVersion: config.extensions.telemetry?.serviceVersion
    });

    StormTrace.#tracer = api.trace.getTracer(serviceName);

    StormLog.initialize(config, serviceName, streams);
  };

  public static async span<TFunct extends (span: Span) => unknown>(
    spanId: string,
    funct: TFunct,
    options: SpanOptions = {},
    context?: Context
  ): Promise<ReturnType<TFunct>> {
    const spanFunct = async (span: api.Span) => {
      const result = await Promise.resolve(funct(span));

      return result as ReturnType<TFunct>;
    };

    const opts: SpanOptions = {
      kind: SpanKind.SERVER,
      attributes: {
        ...options?.attributes,
        correlationId: uuid(),
        serviceName: StormTrace.name
      },
      ...options
    };
    if (context) {
      return StormTrace.#tracer.startActiveSpan(
        `${StormTrace.name} > ${spanId}`,
        opts,
        context,
        spanFunct
      );
    }

    return StormTrace.#tracer.startActiveSpan(
      `${StormTrace.name} > ${spanId}`,
      opts,
      spanFunct
    );
  }

  protected constructor() {
    super();
  }
}
