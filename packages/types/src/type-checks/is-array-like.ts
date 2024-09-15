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

import { isEmpty } from "./is-empty";
import { isNumber } from "./is-number";
import { isObject } from "./is-object";

/**
 * Check if the provided value's type is "array-like"
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the object provided is "array-like"
 */
export const isArrayLike = (value: any): boolean => {
  return (
    isObject(value) &&
    !isEmpty(value) &&
    "length" in value &&
    isNumber(value.length) &&
    (value.length === 0 ||
      (value.length > 0 &&
        Object.prototype.hasOwnProperty.call(value, value.length - 1)))
  );
};
