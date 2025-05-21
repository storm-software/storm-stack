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

import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context, Options } from "../../../types/build";

export function writeApp<TOptions extends Options = Options>(
  _context: Context<TOptions>
) {
  return `${getFileHeader()}

import type {
  HandlerFunction,
  StormContext,
  StormRuntimeParams,
} from "@storm-stack/types/node";
import type {
  IStormPayload
} from "@storm-stack/types/payload";
import type {
  IStormResult
} from "@storm-stack/types/result";
import { isError } from "@stryke/type-checks/is-error";
import type { StormEnv } from "@storm-stack/types/env";
import { STORM_ASYNC_CONTEXT } from "./context";
import { getBuildInfo, getRuntimeInfo } from "./env";
import { getErrorFromUnknown, StormError } from "./error";
import { StormEvent } from "./event";
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
  const name = $storm.vars.APP_NAME;
  const version = $storm.vars.APP_VERSION;
  const build = getBuildInfo();
  const runtime = getRuntimeInfo();

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
      log: log.with({ name, version, payloadId: payload.id }),
      storage,
      vars: {} as StormEnv,
      emit: (_event: StormEvent) => {},
      __internal: {
        events: [] as StormEvent[]
      }
    } as StormContext<StormEnv>;

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
        } catch (e) {
          context.log.fatal(getErrorFromUnknown(e));
          return StormResult.create(error);
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
