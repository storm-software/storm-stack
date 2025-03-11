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

import { getFileHeader } from "storm-stack/helpers";

export function writeCreateApp() {
  return `${getFileHeader()}
import type { MaybePromise } from "@stryke/types";
import { InjectorContext } from "@deepkit/injector";
import {
  getAppName,
  getAppVersion,
  getBuildInfo,
  getRuntimeInfo,
  STORM_ASYNC_CONTEXT
} from "./context";
import type {
  StormEnv
} from "storm-stack/types";
import type {
  StormContext,
  StormRuntimeParams
} from "@storm-stack/plugin-node/types";
import { getErrorFromUnknown } from "./error";
import { StormEvent } from "./event";
import { StormRequest } from "./request";
import { StormResponse } from "./response";

/**
 * Creates a Storm application.
 *
 * @remarks
 * This function is the main entry point for Storm Stack applications.
 *
 * @param handler - The main handler function for the application.
 * @param params - Optional configuration parameters for the application.
 * @returns A function that takes an request and returns a result or a promise of a result.
 */
export function createStormApp<TRequest extends StormRequest, TResponseData = any>(
  handler: (request: TRequest) => MaybePromise<TResponseData | StormError>,
  params: StormRuntimeParams
) {
  const name = params.name || getAppName();
  const version = getAppVersion();
  const buildInfo = getBuildInfo();
  const runtimeInfo = getRuntimeInfo();
  const injector = InjectorContext.forProviders(params.providers ?? []);

  const disposables = new Set<Disposable>();
  const asyncDisposables = new Set<AsyncDisposable>();

  async function handleExit(): Promise<void> {
    for (const disposable of disposables) {
      disposable[Symbol.dispose]();
    }
    disposables.clear();

    const promises = [] as PromiseLike<void>[];
    for (const disposable of asyncDisposables) {
      promises.push(disposable[Symbol.asyncDispose]());
      asyncDisposables.delete(disposable);
    }
    await Promise.all(promises);
  }

  const log = new StormLog(Array.isArray(params.log) ? params.log : [params.log]);
  for (const sink of log.sinks) {
    if (Symbol.asyncDispose in sink) {
      asyncDisposables.add(sink as AsyncDisposable);
    }
    if (Symbol.dispose in sink) {
      disposables.add(sink as Disposable);
    }
  }

  if ("process" in globalThis && !("Deno" in globalThis)) {
    // @ts-ignore: It's fine to use process in Node
    // deno-lint-ignore no-process-global
    process.on("exit", handleExit);
  }

  return async function wrappedHandler(request: TRequest): Promise<StormResponse<TResponseData | StormError>> {
    const context = {
      name,
      version,
      request,
      meta: request.meta,
      log: log.with({ name, version, requestId: request.id }),
      buildInfo,
      runtimeInfo,
      env: {} as StormEnv,
      injector,
      emit: (event: StormEvent) => {},
      __internal: {
        events: [] as StormEvent[]
      }
    } as StormContext<StormEnv, TRequest>;

    function emit(event: StormEvent) {
      context.log.debug(
        \`The \${event.label} event was emitted by the application.\`,
        {
          event,
        }
      );

      context.__internal.events.push(event);
    };
    context.emit = emit;

    context.log.debug(
      "Starting the application handler process.",
      {
        request,
      }
    );

    const response = await STORM_ASYNC_CONTEXT.callAsync(context, async () => {
      try {
        const result = await Promise.resolve(handler(request));

        return new StormResponse<TResponseData>(context.request.id, context.meta, result);
      } catch (exception) {
        const error = getErrorFromUnknown(exception);
        context.log.fatal(
          "The application was forced to terminate due to a fatal error.",
          {
            error,
          }
        );

        return new StormResponse(context.request.id, context.meta, error);
      }
     });

    context.log.debug(
      "The application handler process has completed.",
      {
        response,
      }
    );

    return response;
  };
}`;
}
