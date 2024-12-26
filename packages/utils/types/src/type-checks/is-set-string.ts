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

import { isSet } from "./is-set";
import { isString } from "./is-string";

/**
 * Determine if the type is string and is not empty (length greater than zero)
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `string` and length greater than zero
 */
export const isSetString = (value: unknown): value is NonNullable<string> => {
  try {
    return isSet(value) && isString(value) && value.length > 0;
  } catch {
    return false;
  }
};
