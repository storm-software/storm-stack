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
 Licensing:       https://stormsoftware.com/projects/storm-stack/licensing

 -------------------------------------------------------------------*/

import { getObjectTag } from "./get-object-tag";

export function isSyncFunction(value?: any): value is Function {
  return getObjectTag(value) === "[object Function]";
}

export function isAsyncFunction(value?: any): value is Function {
  return getObjectTag(value) === "[object AsyncFunction]";
}

/**
 * Check if the provided value's type is `Function`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Function`
 */
export const isFunction = (
  value: unknown
): value is ((params?: unknown) => unknown) & ((args?: any[]) => any) => {
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
