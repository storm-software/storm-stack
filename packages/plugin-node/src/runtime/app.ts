/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/helpers";
import { StormStackNodeFeatures } from "../types/config";

export function writeCreateApp(features: StormStackNodeFeatures[]) {
  return `${getFileHeader()}

import type {
  BuilderConfig,
  BuilderResult,
  DeserializerFunction,
  HandlerFunction,
  SerializerFunction,
  StormContext,
  StormRuntimeParams,
  ValidatorFunction,
  SetupFunction,
  CleanupFunction,
  PreprocessFunction,
  PostprocessFunction
} from "@storm-stack/plugin-node/types";
import { isError } from "@stryke/type-checks/is-error";
import type { StormEnv } from "@storm-stack/types/env";
import {${
    features.includes(StormStackNodeFeatures.ENV_PATHS)
      ? `
  envPaths,`
      : ""
  }
  getBuildInfo,
  getRuntimeInfo,
  STORM_ASYNC_CONTEXT
} from "./context";
import { getErrorFromUnknown, StormError } from "./error";
import { StormEvent } from "./event";
import { uniqueId } from "./id";
import { StormRequest } from "./request";
import { StormResponse } from "./response";
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

    const name = params.name || $storm.env.APP_NAME;
    const version = $storm.env.APP_VERSION;
    const build = getBuildInfo();
    const runtime = getRuntimeInfo();${
      features.includes(StormStackNodeFeatures.ENV_PATHS)
        ? `
    const paths = envPaths;`
        : ""
    }

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
        if (isError(request)) {
          return StormResponse.create(request);
        }

        const context = {
          name,
          version,
          request,
          meta: request.meta,${
            features.includes(StormStackNodeFeatures.ENV_PATHS)
              ? `
          paths,`
              : ""
          }
          build,
          runtime,
          log: log.with({ name, version, requestId: request.id }),
          storage,
          env: {} as StormEnv,
          emit: (_event: StormEvent) => {},
          __internal: {
            events: [] as StormEvent[]
          }
        } as StormContext<StormEnv, {${
          features.includes(StormStackNodeFeatures.ENV_PATHS)
            ? ` paths: EnvPaths `
            : ""
        }}, TRequest>;

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
                const validatorResult = await Promise.resolve(
                  builderConfig.validator(context)
                );
                if (isError(validatorResult)) {
                  return StormResponse.create(validatorResult);
                }
              }

              if (builderConfig.preprocess) {
                const preprocessResult = await Promise.resolve(
                  builderConfig.preprocess(context)
                );
                if (isError(preprocessResult)) {
                  return StormResponse.create(preprocessResult);
                }
              }

              const result = await Promise.resolve(
                builderConfig.handler!(request as TRequest)
              );
              if (isError(result)) {
                return StormResponse.create(result);
              }

              if (builderConfig.postprocess) {
                const postprocessResult = await Promise.resolve(
                  builderConfig.postprocess(context)
                );
                if (isError(postprocessResult)) {
                  return StormResponse.create(postprocessResult);
                }
              }

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

    result.setup = (setupFn: SetupFunction) => {
      if (builderConfig.setup) {
        // eslint-disable-next-line no-console
        console.warn(
          "A setup function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.setup = setupFn;
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

    result.validator = (validatorFn: ValidatorFunction<TRequest, TContext>) => {
      if (builderConfig.validator) {
        // eslint-disable-next-line no-console
        console.warn(
          "A validator function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.validator = validatorFn;
      return createBuilderResult();
    };

    result.preprocess = (preprocessFn: PreprocessFunction<TRequest, TContext>) => {
      if (builderConfig.preprocess) {
        // eslint-disable-next-line no-console
        console.warn(
          "A preprocess function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.preprocess = preprocessFn;
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

    result.postprocess = (postprocessFn: PostprocessFunction<TRequest, TContext, TResponse>) => {
      if (builderConfig.postprocess) {
        // eslint-disable-next-line no-console
        console.warn(
          "A postprocess function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.postprocess = postprocessFn;
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

    result.cleanup = (cleanupFn: CleanupFunction) => {
      if (builderConfig.cleanup) {
        // eslint-disable-next-line no-console
        console.warn(
          "A cleanup function has already been configured. Please ensure you meant to overwrite the previously configured value."
        );
      }

      builderConfig.cleanup = cleanupFn;
      return createBuilderResult();
    };

    return result;
  };

  return createBuilderResult();
}


`;
}
