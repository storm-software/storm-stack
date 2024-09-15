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

import { Integer } from "../utility-types/number";
import { isNumber } from "./is-number";
import { isString } from "./is-string";

/**
 * Check if the provided value's type is an integer
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `number` and is an integer
 */
export const isInteger = <T extends number>(value: T): value is Integer<T> =>
  isNumber(value) && !isString(value) && value % 1 === 0;
