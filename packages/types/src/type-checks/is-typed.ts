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

import { ITyped } from "../utility-types/base";
import { isObject } from "./is-object";
import { isSet } from "./is-set";

/**
 * Check if the provided value has a `__typename` property
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided has a `__typename` property
 */
export const isTyped = (value: unknown): value is ITyped => {
  try {
    return isSet(value) && isObject(value) && "__typename" in value;
  } catch {
    return false;
  }
};
