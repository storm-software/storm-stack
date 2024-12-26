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

import { isFunction } from "@storm-stack/types/type-checks/is-function";
import { Ref, RefObject, useCallback } from "react";

// from radix
// https://raw.githubusercontent.com/radix-ui/primitives/main/packages/react/compose-refs/src/composeRefs.tsx

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 *
 * @param ref - The ref to set
 * @param value - The value to set the ref to
 */
export function setRef<T>(ref: Ref<T> | undefined, value: T) {
  if (ref) {
    if (isFunction(ref)) {
      ref(value);
    } else {
      (ref as RefObject<T>).current = value;
    }
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 *
 * @param refs - The refs to compose
 * @returns A function that sets all refs to a given value
 */
export function composeRefs<T>(...refs: Ref<T>[]) {
  return (node: T) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 *
 * @param refs - The refs to compose
 * @returns A function that sets all refs to a given value
 */
export function useComposedRefs<T>(...refs: Ref<T>[]) {
  return useCallback(composeRefs(...refs), refs);
}
