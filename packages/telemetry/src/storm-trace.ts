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

import { Context, Span, SpanOptions } from "@opentelemetry/api";
import { api } from "@opentelemetry/sdk-node";
import type { StormConfig } from "@storm-software/config";
import { StormError } from "@storm-stack/errors/storm-error";
import { StormLog } from "@storm-stack/logging/storm-log";
import type pino from "pino";
import { TelemetryErrorCode } from "./errors";
import { initOtel } from "./otel/init";
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
   * @param name - The name of the project to initialized the loggers for
   * @returns The initialized loggers
   */
  public static override initialize = (
    config: StormConfig<"telemetry", TelemetryConfig>,
    name?: string,
    streams: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[] = []
  ) => {
    if (!name && !config.extensions.telemetry?.serviceId) {
      throw StormError.create(TelemetryErrorCode.missing_service_id);
    }

    initOtel({
      serviceId: name || config.extensions.telemetry?.serviceId
    });
    StormTrace.#tracer = api.trace.getTracer(
      name || config.extensions.telemetry?.serviceId
    );

    StormLog.initialize(config, name, streams);
  };

  public static async span<TFunct extends (span: Span) => unknown>(
    spanName: string,
    funct: TFunct,
    options?: SpanOptions,
    context?: Context
  ): Promise<ReturnType<TFunct>> {
    const spanFunct = async (span: api.Span) => {
      const result = await Promise.resolve(funct(span));

      return result as ReturnType<TFunct>;
    };

    if (options && context) {
      return StormTrace.#tracer.startActiveSpan(
        `${StormTrace.name} > ${spanName}`,
        options,
        context,
        spanFunct
      );
    } else if (options) {
      return StormTrace.#tracer.startActiveSpan(
        `${StormTrace.name} > ${spanName}`,
        options,
        spanFunct
      );
    }

    return StormTrace.#tracer.startActiveSpan(
      `${StormTrace.name} > ${spanName}`,
      spanFunct
    );
  }

  protected constructor() {
    super();
  }
}
