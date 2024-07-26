import { getObjectTag } from "./get-object-tag";
import { isObjectLike } from "./is-plain-object";

/**
 * Checks if `value` is classified as a `isRegExp` object.
 *
 * @example
 * ```typescript
 * isRegExp(new Date)
 * // => true
 *
 * isRegExp('Mon April 23 2012')
 * // => false
 * ```
 *
 * @param value - The value to check.
 * @returns Returns `true` if `obj` is a isRegExp object, else `false`.
 */
export const isRegExp = (value: unknown): value is RegExp =>
  isObjectLike(value) && getObjectTag(value) === "[object RegExp]";
