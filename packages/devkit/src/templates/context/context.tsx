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

import type { ComponentContext, ShallowReactive } from "@alloy-js/core";
import { createNamedContext, useContext } from "@alloy-js/core";
import type { Context as BaseContext } from "@storm-stack/core/types/context";

/**
 * The Storm Stack context used in template rendering.
 */
export const StormStackContext: ComponentContext<ShallowReactive<BaseContext>> =
  createNamedContext<ShallowReactive<BaseContext>>("Storm Stack - Context");

/**
 * Hook to access the Storm Stack Context.
 *
 * @returns The Context.
 */
export function useStormStack() {
  const context = useContext<ShallowReactive<BaseContext>>(StormStackContext)!;

  if (!context) {
    throw new Error(
      "Storm Stack - Context is not set. Make sure this component is wrapped in a `Output` component or being rendered by the `RenderPlugin` from `@storm-stack/devkit`."
    );
  }

  return context;
}
