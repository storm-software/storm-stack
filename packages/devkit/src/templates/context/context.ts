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

import type { ComponentContext, Ref } from "@alloy-js/core";
import { createContext, useContext } from "@alloy-js/core";
import type { Context as BaseContext } from "@storm-stack/core/types/context";

export interface StormStackContextInterface<
  TContext extends BaseContext = BaseContext
> {
  ref: Ref<TContext>;
}

/**
 * The Storm Stack context used in template rendering.
 */
export const StormStackContext: ComponentContext<
  StormStackContextInterface<any>
> = createContext<StormStackContextInterface<any>>();

/**
 * Hook to access the Storm Stack Context.
 *
 * @returns The Context.
 */
export function useStormStack<TContext extends BaseContext = BaseContext>():
  | StormStackContextInterface<TContext>
  | undefined {
  return useContext<StormStackContextInterface<TContext>>(StormStackContext);
}

/**
 * Hook to access the Storm Stack Context.
 *
 * @returns The reactive context ref.
 */
export function useStorm<TContext extends BaseContext = BaseContext>():
  | Ref<TContext>
  | undefined {
  const storm =
    useContext<StormStackContextInterface<TContext>>(StormStackContext);

  return storm?.ref;
}
