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

import { AnyFunction } from "../utility-types/base";
import { getObjectTag } from "./get-object-tag";

export function isSyncFunction(value?: any): value is AnyFunction {
  return getObjectTag(value) === "[object Function]";
}

export function isAsyncFunction(value?: any): value is AnyFunction {
  return getObjectTag(value) === "[object AsyncFunction]";
}

/**
 * Check if the provided value's type is `Function`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Function`
 */
export const isFunction = (value: unknown): value is AnyFunction => {
  try {
    return (
      value instanceof Function ||
      typeof value === "function" ||
      Boolean(
        value?.constructor && (value as any)?.call && (value as any)?.apply
      ) ||
      isSyncFunction(value) ||
      isAsyncFunction(value)
    );
  } catch {
    return false;
  }
};
