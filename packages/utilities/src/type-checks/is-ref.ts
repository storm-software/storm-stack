import type { RefObject } from "../types";

/**
 * Check if the provided value's type is a ref
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the object provided is of type ref
 */
export const isRef = <TRef = unknown>(
  value: unknown
): value is RefObject<TRef> => {
  try {
    return (value as RefObject<TRef>)?.current !== undefined;
  } catch (_) {
    return false;
  }
};
