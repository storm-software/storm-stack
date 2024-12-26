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

import { useEffect, useRef, useState } from "react";

/**
 * Forked from use-memo-one by Alex Reardon
 */

type Cache<TData> = {
  inputs?: any[];
  result: TData;
};

const areInputsEqual = (newInputs: any[], lastInputs: any[]) => {
  // no checks needed if the inputs length has changed
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  // Using for loop for speed. It generally performs better than array.every
  // https://github.com/alexreardon/memoize-one/pull/59

  for (const [i, newInput] of newInputs.entries()) {
    // using shallow equality check
    if (newInput !== lastInputs[i]) {
      return false;
    }
  }

  return true;
};

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
 * @param getResult - The function used to generate the result
 * @param inputs - The inputs to watch for changes
 * @returns The memoized result
 */
export function useMemoStable<TResult>(
  getResult: () => TResult,
  inputs?: any[]
): TResult {
  // using useState to generate initial value as it is lazy
  const initial: Cache<TResult> = useState(() => ({
    inputs,
    result: getResult()
  }))[0];
  const isFirstRun = useRef<boolean>(true);
  const committed = useRef<Cache<TResult>>(initial);

  // persist any uncommitted changes after they have been committed
  const useCache: boolean =
    isFirstRun.current ||
    Boolean(
      inputs &&
        committed.current.inputs &&
        areInputsEqual(inputs, committed.current.inputs)
    );

  // create a new cache if required
  const cache: Cache<TResult> = useCache
    ? committed.current
    : {
        inputs,
        result: getResult()
      };

  // commit the cache
  useEffect(() => {
    isFirstRun.current = false;
    committed.current = cache;
  }, [cache]);

  return cache.result;
}
