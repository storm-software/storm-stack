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

import * as React from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

type AnyFunction = (...args: any[]) => any;

/**
 * The function returns a memoized event handler.
 *
 * @param callback - The event handler to memoize.
 * @returns A memoized event handler.
 */
export function useEvent<T extends AnyFunction>(callback?: T): T {
  return useGet(callback, defaultValue, true) as T;
}

const defaultValue = () => {
  throw new Error("Cannot call an event handler while rendering.");
};

// keeps a reference to the current value easily
function useGet<A>(
  currentValue: A,
  initialValue?: any,
  forwardToFunction?: boolean
): () => A {
  const curRef = React.useRef<any>(initialValue ?? currentValue);
  useIsomorphicLayoutEffect(() => {
    curRef.current = currentValue;
  });

  return React.useCallback(
    forwardToFunction
      ? (...args) => curRef.current?.apply(null, args)
      : () => curRef.current,
    []
  );
}
