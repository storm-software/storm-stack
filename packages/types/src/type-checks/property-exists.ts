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

import { isObject } from "./is-object";

/**
 * Check if the provided object has the provided property
 *
 * @param object - The object to check
 * @param propertyKey - The property to check
 * @returns An indicator specifying if the object has the provided property
 */
export const propertyExists = (object: any, propertyKey: PropertyKey) => {
  try {
    return isObject(object) && propertyKey in object;
  } catch {
    return false;
  }
};

/**
 * Check if the provided object has the provided property and if it's safe to merge
 *
 * @param object - The object to check
 * @param propertyKey - The property to check
 * @returns An indicator specifying if the object has the provided property and if it's safe to merge
 */
export const propertyUnsafe = (object: any, propertyKey: PropertyKey) => {
  return (
    propertyExists(object, propertyKey) && // Properties are safe to merge if they don't exist in the target yet,
    !(
      Object.hasOwnProperty.call(object, propertyKey) && // unsafe if they exist up the prototype chain,
      Object.propertyIsEnumerable.call(object, propertyKey)
    )
  ); // and also unsafe if they're non-enumerable.
};
