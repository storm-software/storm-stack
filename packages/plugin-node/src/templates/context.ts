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
import { StormResultInterface } from "@storm-stack/types/node/result";
import { StormStorageInterface } from "@storm-stack/types/shared/storage";
import { StormLogInterface } from "@storm-stack/types/shared/log";
import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";
import type { UseContext } from "unctx";
import { createConfig, StormConfig } from "storm:config";
import { createEnv } from "storm:env";
import { createStorage } from "storm:storage";
import { createStormError, StormError, isError } from "storm:error";
import { StormEvent } from "storm:event";
import { StormLog } from "storm:log";
import { StormRequest } from "storm:request";
import { StormResult } from "storm:result";

export interface StormContext {
  /**
   * The context metadata.
   */
  meta: Record<string, any>;

  /**
   * The request object for the current Storm Stack application.
   */
  request: StormRequest

  /**
   * Environment/runtime specific application data.
   */
  env: import("@storm-stack/types/node/env").StormNodeEnv

  /**
   * The root application logger for the Storm Stack application.
   */
  log: import("@storm-stack/types/shared/log").StormLogInterface

  /**
   * The {@link StormStorageInterface} instance used by the Storm Stack application.
   */
  storage: import("@storm-stack/types/shared/storage").StormStorageInterface

  /**
   * The configuration parameters for the Storm application.
   */
  config: StormConfig & Record<string, any>;

  /**
   * A set of disposable resources to clean up when the context is no longer needed.
   */
  readonly disposables: Set<Disposable>

  /**
   * A set of asynchronous disposable resources to clean up when the context is no longer needed.
   */
  readonly asyncDisposables: Set<AsyncDisposable>
}

const STORM_ASYNC_CONTEXT: UseContext<StormContext> = getContext<StormContext>(
  "__storm-stack__", {
  asyncContext: true,
  AsyncLocalStorage
});

/**
 * Get the Storm context for the current application.
 *
 * @returns The Storm context for the current application.
 * @throws If the Storm context is not available.
 */
export function useStorm(): StormContext {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch(error) {
    throw new Error(
      \`The Storm context is not available. Make sure to use \\\`$storm\\\` and \\\`useStorm\\\` within a Storm Stack application (must be wrapped with \\\`withContext\\\`): \${error.message}\`,
      { cause: error }
    );
  }
}

/**
 * Wrap an application entry point with the necessary context and error handling.
 *
 * @param handler - The handler function for the application.
 * @returns A function that takes an request and returns a result or a promise of a result.
 */
export function withContext<
  TInput extends Record<string, any> = Record<string, any>,
  TOutput = any
>(
  handler: HandlerFunction<TInput, TOutput>
) {
  return async function wrapper(input: TInput): Promise<StormResult<TOutput | StormError>> {
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

    const result = await STORM_ASYNC_CONTEXT.callAsync(
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
            return StormResult.create(ret);
          }

          return StormResult.create(ret);
        } catch (err) {
          console.error(err);
          if (context.log) {
            context.log.fatal(createStormError(err));
          }

          return StormResult.create(err);
        } finally {
          if (context.log) {
            context.log.debug("The application handler process has completed.", {
              result
            });
          } else {
            console.log("The application handler process has completed.");
          }
        }
      }
    );

    return result;
  };
}

`;
}
