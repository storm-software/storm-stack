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
import { kebabCase } from "@stryke/string-format/kebab-case";

export function ContextModule(context: Context) {
  return `
/**
 * This module provides the Storm Stack context and a hook to access it in the application.
 *
 * @module storm:context
 */

${getFileHeader()}

import {
  StormContextInterface,
  StormConfigContext,
} from "@storm-stack/types/node/context";
import { StormEnvInterface } from "@storm-stack/types/env";
import { HandlerFunction } from "@storm-stack/types/app";
import { StormResultInterface } from "@storm-stack/types/result";
import { StormStorageInterface } from "@storm-stack/types/storage";
import { StormLogInterface } from "@storm-stack/types/log";
import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";
import type { UseContext } from "unctx";
import { createConfig, StormConfig } from "storm:config";
import { createEnvironment } from "storm:env";
import { createStorage } from "storm:storage";
import { createStormError, StormError, isError } from "storm:error";
import { StormEvent } from "storm:event";
import { StormLog } from "storm:log";
import { StormPayload } from "storm:payload";
import { StormResult } from "storm:result";

export type StormContext = StormContextInterface<
  StormConfig,
  StormEnvInterface
>;

export const STORM_ASYNC_CONTEXT: UseContext<StormContext> = getContext<StormContext>(
  "storm-stack", {
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
 * @returns A function that takes an payload and returns a result or a promise of a result.
 */
export function withContext<
  TInput extends Record<string, any> = Record<string, any>,
  TOutput = any
>(
  handler: HandlerFunction<TInput, TOutput>
) {
  return async function wrapper(input: TInput): Promise<StormResult<TOutput | StormError>> {
    const payload = new StormPayload<TInput>(input);

    const context = {
      name: "${kebabCase(context.options.name)}",
      version: "${
        context.packageJson?.version
          ? context.packageJson.version
          : "$storm.config.static.APP_VERSION"
      }",
      meta: {},
      env: {} as StormEnvInterface,
      config: {} as StormConfigContext<StormConfig>,
      storage: {} as StormStorageInterface,
      log: {} as StormLogInterface,
      payload,
      disposables: new Set<Disposable>(),
      asyncDisposables: new Set<AsyncDisposable>(),
      emit(event: StormEvent) {},
      __internal: {
        events: [] as StormEvent[]
      }
    } as StormContext;

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

    const result = await STORM_ASYNC_CONTEXT.callAsync(
      context,
      async () => {
        try {
          context.config = await createConfig() as StormConfigContext<StormConfig>;
          context.env = createEnvironment();

          context.storage = createStorage();
          context.asyncDisposables.add(context.storage);

          const log = new StormLog();
          context.log = log.with({
            name: context.name,
            version: context.version,
            payloadId: context.payload.id
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
            payload
          });

          const ret = await Promise.resolve(
            handler(payload)
          );
          if (isError(ret)) {
            context.log.error(ret);
            return StormResult.create(ret);
          }

          return StormResult.create(ret);
        } catch (err) {
          context.log.fatal(new StormError(err));
          return StormResult.create(err);
        } finally {
          context.log.debug("The application handler process has completed.", {
            result
          });
        }
      }
    );

    return result;
  };
}

`;
}
