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

import { DeepKey, isObjectIndex, isString } from "@storm-stack/types";
import { toPath } from "./to-path";

/**
 * Sets a value at a given deep path in an object.
 *
 * @param object - The object to set the value in.
 * @param path - The deep path to set the value at.
 * @param value - The value to set.
 * @returns The object with the value set at the given deep path.
 */
export function setField<
  TObject extends Record<string, any> = Record<string, any>
>(object: TObject, path: DeepKey<TObject>, value: unknown): TObject {
  const resolvedPath = Array.isArray(path)
    ? path
    : isString(path)
      ? toPath(path)
      : [path];

  let current: any = object;
  for (let i = 0; i < resolvedPath.length - 1; i++) {
    const key = resolvedPath[i];
    const nextKey = resolvedPath[i + 1];

    if (current[key] === null) {
      current[key] = isObjectIndex(nextKey) ? [] : {};
    }

    current = current[key];
  }

  const lastKey = resolvedPath.at(-1);
  if (lastKey) {
    current[lastKey] = value;
  }

  return object;
}
