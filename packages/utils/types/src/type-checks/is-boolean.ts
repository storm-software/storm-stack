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
 * Check if the provided value's type is `boolean`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `boolean`
 */
export const isBoolean = (value: unknown): value is boolean => {
  try {
    return (
      value instanceof Boolean ||
      typeof value === "boolean" ||
      Boolean(value) === value
    );
  } catch {
    return false;
  }
};
