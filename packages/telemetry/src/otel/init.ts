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

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { Resource } from "@opentelemetry/resources";
import { logs, NodeSDK, tracing } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from "@opentelemetry/semantic-conventions";

export interface InitOtelOptions {
  serviceName: string;
  serviceVersion?: string;
}

export const initOtel = (options: InitOtelOptions) => {
  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: options.serviceName,
      [ATTR_SERVICE_VERSION]: options.serviceVersion || "1.0.0"
    }),
    spanProcessor: new tracing.SimpleSpanProcessor(
      new tracing.ConsoleSpanExporter()
    ),
    logRecordProcessor: new logs.SimpleLogRecordProcessor(
      new logs.ConsoleLogRecordExporter()
    ),
    traceExporter: new ConsoleSpanExporter(),
    metricReader: new PrometheusExporter({
      host: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      appendTimestamp: true
    }),
    instrumentations: [
      getNodeAutoInstrumentations(),
      new PinoInstrumentation({
        logKeys: {
          traceId: "correlationId",
          spanId: "spanId",
          traceFlags: "data"
        }
      })
    ]
  });

  sdk.start();
};
