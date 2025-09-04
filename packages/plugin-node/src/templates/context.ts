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

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import type { Context } from "@storm-stack/core/types/context";

export function ContextModule(_context: Context) {
  return `
/**
 * This module provides the Storm Stack context and a hook to access it in the application.
 *
 * @module storm:context
 */

${getFileHeader()}

import { StormNodeEnv } from "@storm-stack/types/node/env";
import { HandlerFunction } from "@storm-stack/types/node/app";
import { StormStorageInterface } from "@storm-stack/types/shared/storage";
import { StormLogInterface } from "@storm-stack/types/shared/log";
import { StormContextInterface } from "@storm-stack/types/shared/context";
import { AsyncLocalStorage } from "node:async_hooks";
import type {
  UseContext,
  ContextOptions,
  ContextNamespace,
  OnAsyncRestore,
  OnAsyncLeave
} from "@storm-stack/plugin-node/types/context";
import { createConfig, StormConfig } from "storm:config";
import { createEnv } from "storm:env";
import { createStorage } from "storm:storage";
import { createStormError, StormError, isError } from "storm:error";
import { StormLog } from "storm:log";
import { StormRequest } from "storm:request";
import { StormResponse } from "storm:response";

/**
 * The global Storm context for the current application.
 *
 * @remarks
 * This interface extends the base Storm context interface with additional properties specific to the NodeJs application.
 */
export interface StormContext extends StormContextInterface {
  /**
   * The context metadata.
   */
  meta: Record<string, any>;

  /**
   * The request object for the current Storm Stack application.
   */
  request: StormRequest;

  /**
   * Environment/runtime specific application data.
   */
  env: import("@storm-stack/types/node/env").StormNodeEnv;

  /**
   * The root application logger for the Storm Stack application.
   */
  log: import("@storm-stack/types/shared/log").StormLogInterface;

  /**
   * The {@link StormStorageInterface} instance used by the Storm Stack application.
   */
  storage: import("@storm-stack/types/shared/storage").StormStorageInterface;

  /**
   * The configuration parameters for the Storm application.
   */
  config: StormConfig & Record<string, any>;

  /**
   * A set of disposable resources to clean up when the context is no longer needed.
   */
  readonly disposables: Set<Disposable>;

  /**
   * A set of asynchronous disposable resources to clean up when the context is no longer needed.
   */
  readonly asyncDisposables: Set<AsyncDisposable>;
}

/* eslint-disable */
const _globalThis = (
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
      ? self
      : typeof global !== "undefined"
        ? global
        : typeof window !== "undefined"
          ? window
          : {}
) as typeof globalThis;
/* eslint-enable */

const asyncHandlers: Set<OnAsyncLeave> =
  (_globalThis as any)["__storm_async_handlers__"] ||
  ((_globalThis as any)["__storm_async_handlers__"] = new Set());

/**
 * Create a new context.
 *
 * @param options - The options to use for the context.
 * @returns A new context.
 */
function createContext<T = any>(
  options: ContextOptions = {},
): UseContext<T> {
  let currentInstance: T | undefined;
  let isSingleton = false;

  const checkConflict = (instance: T | undefined) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };

  // Async context support
  let als: AsyncLocalStorage<any>;
  if (options.asyncContext) {
    const _AsyncLocalStorage: typeof AsyncLocalStorage<any> =
      options.AsyncLocalStorage || (globalThis as any).AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("\`AsyncLocalStorage\` is not provided.");
    }
  }

  const _getCurrentInstance = () => {
    // TODO: Investigate better solution to make sure currentInstance is in sync with AsyncLocalStorage
    // https://github.com/unjs/unctx/issues/100
    if (als /* && currentInstance === undefined */) {
      const instance = als.getStore();
      if (instance !== undefined) {
        return instance;
      }
    }
    return currentInstance;
  };

  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === undefined) {
        throw new Error(
          \`The Storm context is not available. Make sure to use \\\`$storm\\\` and \\\`useStorm\\\` within a Storm Stack application (must be wrapped with \\\`withContext\\\`).\`
        );
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance: T | undefined, replace?: boolean) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = undefined;
      isSingleton = false;
    },
    call: (instance: T, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = undefined;
        }
      }
    },
    async callAsync(instance: T, callback) {
      currentInstance = instance;
      const onRestore: OnAsyncRestore = () => {
        currentInstance = instance;
      };
      const onLeave: OnAsyncLeave = () =>
        currentInstance === instance ? onRestore : undefined;

      asyncHandlers.add(onLeave);

      try {
        const result = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = undefined;
        }
        return await result;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    },
  };
}

/**
 * Create a new context namespace.
 *
 * @param defaultOptions - The default options to use for the context.
 * @returns A new context namespace.
 */
function createNamespace<T = any>(
  defaultOptions: ContextOptions = {
    asyncContext: true,
    AsyncLocalStorage
  }
) {
  const contexts: Record<string, UseContext<T>> = {};

  return {
    get(key: string, options: ContextOptions = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOptions, ...options });
      }
      return contexts[key] as UseContext<T>;
    },
  };
}

const namespace: ContextNamespace =
  (_globalThis as any)["__storm__"] ||
  ((_globalThis as any)["__storm__"] = createNamespace());

const STORM_CONTEXT_KEY = "__storm_global__";

/**
 * Get the Storm context for the current application.
 *
 * @param options - The options to use when getting the context.
 * @returns The Storm context for the current application.
 * @throws If the Storm context is not available.
 */
export function useStorm(options: ContextOptions = {}): StormContext {
  return namespace.get<StormContext>(STORM_CONTEXT_KEY, options).use();
}

/**
 * Wrap an application entry point with the necessary context and error handling.
 *
 * @param handler - The handler function for the application.
 * @returns A function that takes an request and returns a response or a promise of a response.
 */
export function withContext<
  TInput extends Record<string, any> = Record<string, any>,
  TOutput = any
>(
  handler: HandlerFunction<TInput, TOutput>
) {
  return async function wrapper(input: TInput): Promise<StormResponse<TOutput | StormError>> {
    const request = new StormRequest<TInput>(input);

    const context = {
      meta: {} as Record<string, any>,
      storage: {} as StormStorageInterface,
      log: {} as StormLogInterface,
      env: {} as StormNodeEnv,
      config: {} as StormConfig,
      request,
      disposables: new Set<Disposable>(),
      asyncDisposables: new Set<AsyncDisposable>(),
    } as StormContext;

    // function emit(event: StormEvent) {
    //   context.log.debug(
    //     \`The \${event.label} event was emitted by the application.\`,
    //     {
    //       event
    //     }
    //   );

    //   context.__internal.events.push(event);
    // }
    // context.emit = emit;

    const response = await namespace.get<StormContext>(STORM_CONTEXT_KEY).callAsync(
      context,
      async () => {
        try {
          context.config = await createConfig();
          context.env = createEnv();

          context.storage = createStorage();
          context.asyncDisposables.add(context.storage);

          const log = new StormLog();
          context.log = log.with({
            name: context.env.name,
            version: context.env.version,
            requestId: context.request.id
          });

          for (const adapter of log.adapters()) {
            if (Symbol.asyncDispose in adapter) {
              context.asyncDisposables.add(adapter as AsyncDisposable);
            }
            if (Symbol.dispose in adapter) {
              context.disposables.add(adapter as Disposable);
            }
          }

          context.log.debug("Starting the application handler process.", {
            request
          });

          const ret = await Promise.resolve(
            handler(request)
          );
          if (isError(ret)) {
            context.log.error(ret);
            return StormResponse.create(ret);
          }

          return StormResponse.create(ret);
        } catch (err) {
          console.error(err);
          if (context.log) {
            context.log.fatal(createStormError(err));
          }

          return StormResponse.create(err);
        } finally {
          if (context.log) {
            context.log.debug("The application handler process has completed.", {
              response
            });
          } else {
            console.log("The application handler process has completed.");
          }
        }
      }
    );

    return response;
  };
}

`;
}
