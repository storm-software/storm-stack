/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context } from "../../../types/build";

export function writeApp(_context: Context) {
  return `
/**
 * A module containing a wrapper for the application entry point.
 *
 * @remarks
 * This module provides a function to wrap an application entry point with the necessary context and error handling.
 *
 * @module storm:app
 */

${getFileHeader()}

import {
  HandlerFunction,
  StormContext,
  StormRuntimeParams,
} from "@storm-stack/types/node";
import {
  IStormPayload
} from "@storm-stack/types/payload";
import {
  IStormResult
} from "@storm-stack/types/result";
import { StormConfig } from "./config";
import { STORM_ASYNC_CONTEXT } from "./context";
import { build, name, version, runtime, paths } from "./env";
import { createStormError, StormError, isError } from "./error";
import { StormEvent } from "./event";
import { StormLog } from "./log";
import { uniqueId } from "./id";
import { StormPayload } from "./payload";
import { StormResult } from "./result";
import { storage } from "./storage";

/**
 * Wrap an application entry point with the necessary context and error handling.
 *
 * @param handler - The handler function for the application.
 * @returns A function that takes an payload and returns a result or a promise of a result.
 */
export function withContext<TInput = any, TOutput = any>(
  handler: HandlerFunction<TInput, TOutput>
) {
  const disposables = new Set<Disposable>();
  const asyncDisposables = new Set<AsyncDisposable>();

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

  const log = new StormLog();
  for (const sink of log.sinks()) {
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

  return async function wrapper(input: TInput): Promise<StormResult<TOutput | StormError>> {
    const payload = new StormPayload<TInput>(input);

    const context = {
      name,
      version,
      payload,
      meta: {},
      build,
      runtime,
      paths,
      log: log.with({ name, version, payloadId: payload.id }),
      storage,
      config: {} as StormConfig,
      emit: (_event: StormEvent) => {},
      __internal: {
        events: [] as StormEvent[]
      }
    } as StormContext<StormConfig>;

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
      payload
    });

    const result = await STORM_ASYNC_CONTEXT.callAsync(
      context,
      async () => {
        try {
          const ret = await Promise.resolve(
            handler(payload)
          );
          if (isError(ret)) {
            context.log.error(ret);
            return StormResult.create(ret);
          }

          return StormResult.create(ret);
        } catch (err) {
          context.log.fatal(createStormError(err));
          return StormResult.create(err);
        }
      }
    );

    context.log.debug("The application handler process has completed.", {
      result
    });

    return result;
  };
}
`;
}
