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

import { Collection } from "../utility-types/base";
import { typeDetect } from "./type-detect";

const COLLECTION_TYPE_SET = new Set([
  "Arguments",
  "Array",
  "Map",
  "Object",
  "Set"
]);

/**
 * Check if the provided value's type is `Collection`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Collection`
 */
export function isCollection(value: any): value is Collection {
  return COLLECTION_TYPE_SET.has(typeDetect(value));
}
