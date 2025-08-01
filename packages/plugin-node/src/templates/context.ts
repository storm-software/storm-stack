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

import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";
import type { UseContext } from "unctx";
import {
  StormContext,
} from "@storm-stack/types/node/context";
import { StormError } from "storm:error";
import { StormConfig } from "storm:config";

export const STORM_ASYNC_CONTEXT: UseContext<StormContext<StormConfig>> = getContext<StormContext<StormConfig>>(
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
export function useStorm(): StormContext<StormConfig> {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new StormError({ type: "general", code: 12 });
  }
}

`;
}
