import { isNull } from "./is-null";
import { isObject } from "./is-object";

/**
 * Check if the provided value's type is `AsyncIterable`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the object provided is `AsyncIterable`
 */
export const isAsyncIterable = (
  value: unknown
): value is AsyncIterable<unknown> => {
  return isObject(value) && !isNull(value) && Symbol.asyncIterator in value;
};
