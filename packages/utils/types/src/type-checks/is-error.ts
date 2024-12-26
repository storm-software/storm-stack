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
import { isObject } from "./is-object";
import { isPlainObject } from "./is-plain-object";

/**
 * Checks if `obj` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
 * `SyntaxError`, `TypeError`, or `URIError` object.
 *
 * @example
 * ```typescript
 * isError(new Error)
 * // => true
 *
 * isError(Error)
 * // => false
 * ```
 *
 * @param obj - The obj to check.
 * @returns Returns `true` if `obj` is an error object, else `false`.
 */
export const isError = (obj: unknown): obj is Error => {
  if (!isObject(obj)) {
    return false;
  }

  const tag = getObjectTag(obj);
  return (
    tag === "[object Error]" ||
    tag === "[object DOMException]" ||
    (typeof (obj as Error)?.message === "string" &&
      typeof (obj as Error)?.name === "string" &&
      !isPlainObject(obj))
  );
};
