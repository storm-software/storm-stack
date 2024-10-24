// from radix
// https://raw.githubusercontent.com/radix-ui/primitives/main/packages/react/compose-refs/src/composeRefs.tsx

import { ForwardedRef, Ref, RefObject, useCallback } from "react";

export type ReactRef<T> = Ref<T> | ForwardedRef<T> | RefObject<T>;

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
export function setRef<T>(ref: ReactRef<T> | undefined, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as RefObject<T>).current = value;
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
export function composeRefs<T>(...refs: ReactRef<T>[]) {
  return (node: T) => refs.forEach(ref => setRef(ref, node));
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
export function useComposedRefs<T>(...refs: ReactRef<T>[]) {
  return useCallback(composeRefs(...refs), refs);
}
