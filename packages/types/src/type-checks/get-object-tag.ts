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

/**
 * Gets the `toStringTag` of `obj`.
 *
 * @param value - The obj to query.
 * @returns Returns the `toStringTag`.
 */
export const getObjectTag = (value: unknown): string => {
  // eslint-disable-next-line eqeqeq
  if (value == null) {
    return value === undefined ? "[object Undefined]" : "[object Null]";
  }
  return Object.prototype.toString.call(value);
};
