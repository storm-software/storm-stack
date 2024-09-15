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
