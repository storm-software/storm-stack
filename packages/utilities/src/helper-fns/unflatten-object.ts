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

import { DeepKey, DeepValue } from "@storm-stack/types";
import { set } from "./set";

/**
 * Flattens a nested object into a single level object with dot-separated keys.
 *
 * @example
 * ```typescript
 * const nestedObject = {
 *   a: {
 *     b: {
 *       c: 1
 *     }
 *   },
 *   d: [2, 3]
 * };
 *
 * const flattened = flattenObject(nestedObject);
 * console.log(flattened);
 * // Output:
 * // {
 * //   'a.b.c': 1,
 * //   'd.0': 2,
 * //   'd.1': 3
 * // }
 * ```
 *
 * @param object - The object to flatten.
 * @returns - The flattened object.
 */
export function unflattenObject<
  TObject extends Record<string, any> = Record<string, any>,
  TDeepKeyObject extends {
    [TKey in DeepKey<TObject>]: DeepValue<TObject, TKey>;
  } = { [TKey in DeepKey<TObject>]: DeepValue<TObject, TKey> }
>(deepKeyObject: TDeepKeyObject): TObject {
  return Object.entries(deepKeyObject).reduce(
    (ret: TObject, [key, value]: [string, any]) => {
      return set<TObject>(ret, key as DeepKey<TObject>, value);
    },
    {} as TObject
  );
}
