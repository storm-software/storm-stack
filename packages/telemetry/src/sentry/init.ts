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

import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";
import * as Sentry from "@sentry/node";
import {
  SentryPropagator,
  SentrySampler,
  SentrySpanProcessor,
  setOpenTelemetryContextAsyncContextStrategy,
  setupEventContextTrace,
  wrapContextManagerClass
} from "@sentry/opentelemetry";

export interface InitSentryOptions {
  dsn: string;
  serviceName: string;
  serviceVersion?: string;
  tracesSampleRate?: number;
}

export const initSentry = (options: InitSentryOptions) => {
  Sentry.init({
    dsn: options.dsn,
    serverName: options.serviceName,
    release: options.serviceVersion || "1.0.0",
    environment: process.env.NODE_ENV,
    skipOpenTelemetrySetup: true,
    enabled: true,
    enableTracing: true,
    attachStacktrace: true,
    sendClientReports: true,
    parentSpanIsAlwaysRootSpan: false,
    tracesSampleRate: options.tracesSampleRate ?? 0.8
  });

  const client = Sentry.getClient();
  setupEventContextTrace(client);

  const provider = new BasicTracerProvider({
    sampler: new SentrySampler(client)
  });

  const SentryContextManager = wrapContextManagerClass(
    AsyncLocalStorageContextManager
  );

  provider.addSpanProcessor(new SentrySpanProcessor());
  provider.register({
    propagator: new SentryPropagator(),
    contextManager: new SentryContextManager()
  });

  setOpenTelemetryContextAsyncContextStrategy();
  Sentry.validateOpenTelemetrySetup();
};
