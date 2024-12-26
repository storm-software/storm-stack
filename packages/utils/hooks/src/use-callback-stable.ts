/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { AnyFunction } from "@storm-stack/types/utility-types/base";
import { useMemoStable } from "./use-memo-stable";

/**
 * Forked from use-memo-one by Alex Reardon
 */

/**
 * `useMemo` and `useCallback` cache the most recent result. However, this cache can be destroyed by React when it wants to.
 *
 * `useMemoStable` and `useCallbackStable` are concurrent mode safe alternatives to `useMemo` and `useCallback` that do provide semantic guarantee. What this means is that you will always get the same reference for a memoized value so long as there is no input change.
 *
 * Using `useMemoStable` and `useCallbackStable` will consume more memory than useMemo and `useCallback` in order to provide a stable cache. React can release the cache of `useMemo` and `useCallback`, but `useMemoStable` will not release the cache until it is garbage collected.
 *
 * @remarks
 * You may rely on useMemo as a performance optimization, not as a semantic guarantee. In the future, React may choose to “forget” some previously memoized values and recalculate them on next render, e.g. to free memory for offscreen components. Write your code so that it still works without `useMemo` — and then add it to optimize performance.
 *
 * @param callback - The callback function to memoize
 * @param inputs - The inputs to watch for changes
 * @returns The memoized callback function
 */
export function useCallbackStable<TCallback extends AnyFunction = AnyFunction>(
  callback: TCallback,
  inputs?: any[]
): TCallback {
  return useMemoStable(() => callback, inputs);
}
