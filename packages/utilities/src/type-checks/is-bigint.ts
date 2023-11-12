import { getObjectTag } from "./get-object-tag";

/**
 * Checks if `value` is classified as a `bigint` object.
 *
 * @example
 * ```typescript
 * isDate(37n)
 * // => true
 *
 * isBigInt(37)
 * // => false
 * ```
 *
 * @param value The obj to check.
 * @returns Returns `true` if `value` is a bigint object, else `false`.
 */
export const isBigInt = (value: unknown): value is bigint =>
  typeof value === "bigint" || getObjectTag(value) == "[object BigInt]";
