import { getObjectTag } from "./get-object-tag";
import { isObjectLike } from "./is-plain-object";

/**
 * Checks if `value` is classified as a `Date` object.
 *
 * @example
 * ```typescript
 * isDate(new Date)
 * // => true
 *
 * isDate('Mon April 23 2012')
 * // => false
 * ```
 *
 * @param value - The value to check.
 * @returns Returns `true` if `obj` is a date object, else `false`.
 */
export const isDate = (value: unknown): value is Date =>
  isObjectLike(value) && getObjectTag(value) == "[object Date]";
