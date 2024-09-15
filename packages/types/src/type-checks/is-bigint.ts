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
 * @param value - The obj to check.
 * @returns Returns `true` if `value` is a bigint object, else `false`.
 */
export const isBigInt = (value: unknown): value is bigint =>
  // eslint-disable-next-line eqeqeq
  typeof value === "bigint" || getObjectTag(value) == "[object BigInt]";
