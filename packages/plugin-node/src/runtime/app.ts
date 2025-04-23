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

import { getFileHeader } from "@storm-stack/core/helpers";

export function writeCreateApp() {
  return `${getFileHeader()}

import type {
  BuilderConfig,
  BuilderResult,
  DeserializerFunction,
  HandlerFunction,
  SerializerFunction,
  StormContext,
  StormRuntimeParams,
  ValidatorFunction
} from "@storm-stack/plugin-node/types";
import { isError } from "@stryke/type-checks/is-error";
import type { StormEnv } from "@storm-stack/types/env";
import {
  getAppName,
  getAppVersion,
  getBuildInfo,
  getRuntimeInfo,
  STORM_ASYNC_CONTEXT
} from "./context";
import { getErrorFromUnknown } from "./error";
import type { StormEvent } from "./event";
import { uniqueId } from "./id";
import type { StormRequest } from "./request";
import { StormResponse } from "./response";
import { InjectorContext } from "@deepkit/injector";
import { createStorage } from "unstorage";

/**
 * Creates a Storm application handler.
 *
 * @remarks
 * This function is the main entry point for Storm Stack applications.
 *
 * @param params - Configuration parameters for the application.
 * @param handlerFn - The main handler function for the application.
 * @param validatorFn - A function that validates the request payload and returns a validated payload or an error.
 * @returns A function that takes an request and returns a result or a promise of a result.
 */
export function builder<
  TRequest extends StormRequest,
  TResponse extends StormResponse,
  TPayload,
  TResult
>(params: StormRuntimeParams) {
  const builderConfig = {} as BuilderConfig<
    TRequest,
    TResponse,
    TPayload,
    TResult
  >;

  const build = () => {
    if (!builderConfig.handler || !builderConfig.deserializer || !builderConfig.serializer) {
      const missing = [
        !builderConfig.deserializer && "deserializer",
        !builderConfig.handler && "handler",
        !builderConfig.serializer && "serializer"
      ].filter(Boolean);

      throw new Error(
        \`The \${missing.length > 2 ? [...missing].splice(missing.length - 1, 0, "and").join(", ") : missing.length > 1 ? [...missing].splice(missing.length - 1, 0, "and").join(" ") : missing[0]} function\${missing.length > 1 ? "s" : ""} must be configured. Please add \\\`.\${missing[0]}(<your_function>)\\\` before \\\`.build()\\\` is called.\`
      );
    }

    const name = params.name || getAppName();
    const version = getAppVersion();
    const buildInfo = getBuildInfo();
    const runtimeInfo = getRuntimeInfo();
    const injector = InjectorContext.forProviders(params.providers ?? []);

    const disposables = new Set<Disposable>();
    const asyncDisposables = new Set<AsyncDisposable>();

    const storage = params.storage ?? createStorage();
    async function handleExit(): Promise<void> {
      await storage.dispose();

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

    const log = new StormLog(
      Array.isArray(params.log) ? params.log : [params.log]
    );
    for (const sink of log.sinks) {
      if (Symbol.asyncDispose in sink) {
        asyncDisposables.add(sink as AsyncDisposable);
      }
      if (Symbol.dispose in sink) {
        disposables.add(sink as Disposable);
      }
    }

    if ("process" in globalThis && !("Deno" in globalThis)) {
      // eslint-disable-next-line ts/no-misused-promises
      process.on("exit", handleExit);
    }

    return async function appWrapper(payload: TPayload): Promise<TResult> {
      async function contextWrapper(
        payload: TPayload
      ): Promise<TResponse | StormResponse<StormError>> {
        const request = await Promise.resolve(
          builderConfig.deserializer!(payload)
        );
        if (isError(request) || (Array.isArray(request) && request.length > 0)) {
          // if the deserializer returns an error or an array of issues, we need to return a validation error response
          return new StormResponse(
            uniqueId(),
            {},
            getErrorFromUnknown(null, "validation", request)
          );
        }

        const context = {
          name,
          version,
          request,
          meta: request.meta,
          buildInfo,
          runtimeInfo,
          injector,
          log: log.with({ name, version, requestId: request.id }),
          storage,
          env: {} as StormEnv,
          emit: (_event: StormEvent) => {},
          __internal: {
            events: [] as StormEvent[]
          }
        } as StormContext<StormEnv, TRequest>;

        function emit(event: StormEvent) {
          context.log.debug(
            \`The \${event.label} event was emitted by the application.\`,
            {
              event
            }
          );

          context.__internal.events.push(event);
        }
        context.emit = emit;

        context.log.debug("Starting the application handler process.", {
          request
        });

        const response = await STORM_ASYNC_CONTEXT.callAsync(
          context,
          async () => {
            try {
              if (builderConfig.validator) {
                const issues = await Promise.resolve(
                  builderConfig.validator(context.request)
                );
                if (issues) {
                  return StormResponse.create(
                    getErrorFromUnknown(
                      null,
                      "validation",
                      issues
                    )
                  );
                }
              }

              const result = await Promise.resolve(
                builderConfig.handler!(request as TRequest)
              );

              return StormResponse.create(result);
            } catch (e) {
              const error = getErrorFromUnknown(e);
              context.log.fatal(
                "The application was forced to terminate due to a fatal error.",
                {
                  error
                }
              );

              return StormResponse.create(error);
            }
          }
        );

        context.log.debug("The application handler process has completed.", {
          response
        });

        return response;
      }

      const result = await contextWrapper(payload);
      if (builderConfig.serializer) {
        return Promise.resolve(builderConfig.serializer(result));
      }

      return result as TResult;
    };
  };

  const createBuilderResult = () => {
    const result = {
      build
    } as BuilderResult<TRequest, TResponse, TPayload, TResult>;

    result.validator = (validatorFn: ValidatorFunction<TRequest>) => {
      if (builderConfig.validator) {
        // eslint-disable-next-line no-console
        console.warn(
          "A validator function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.validator = validatorFn;
      return createBuilderResult();
    };
    result.handler = (handlerFn: HandlerFunction<TRequest, TResponse>) => {
      if (builderConfig.handler) {
        // eslint-disable-next-line no-console
        console.warn(
          "A handler function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.handler = handlerFn;
      return createBuilderResult();
    };
    result.serializer = (
      serializerFn: SerializerFunction<TResponse, TResult>
    ) => {
      if (builderConfig.serializer) {
        // eslint-disable-next-line no-console
        console.warn(
          "A serializer function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.serializer = serializerFn;
      return createBuilderResult();
    };

    result.deserializer = (
      deserializerFn: DeserializerFunction<TRequest, TPayload>
    ) => {
      if (builderConfig.deserializer) {
        // eslint-disable-next-line no-console
        console.warn(
          "A deserializer function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.deserializer = deserializerFn;
      return createBuilderResult();
    };

    return result;
  };

  return createBuilderResult();
}


`;
}
