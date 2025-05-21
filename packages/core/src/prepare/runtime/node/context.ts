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

export function writeContext<TOptions extends Options = Options>(
  _context: Context<TOptions>
) {
  return `${getFileHeader()}

import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";
import type {
  StormContext,
} from "@storm-stack/types/node";
import { StormError } from "./error";

const STORM_CONTEXT_KEY = "storm-stack";

export const STORM_ASYNC_CONTEXT = getContext<StormContext>(STORM_CONTEXT_KEY, {
  asyncContext: true,
  AsyncLocalStorage
});

/**
 * Get the Storm context for the current application.
 *
 * @returns The Storm context for the current application.
 * @throws {StormError} If the Storm context is not available.
 */
export function useStorm(): StormContext {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new StormError({ type: "general", code: 12 });
  }
}

`;
}
