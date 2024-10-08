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

const IS_UNSIGNED_INTEGER = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if the given value is an object index.
 *
 * @param value - The value to check.
 * @returns Returns `true` if the value is an object index, otherwise `false`.
 */
export function isObjectIndex(
  value: PropertyKey
): value is string | number | symbol {
  switch (typeof value) {
    case "number": {
      return (
        Number.isInteger(value) && value >= 0 && value < Number.MAX_SAFE_INTEGER
      );
    }
    case "symbol": {
      return false;
    }
    case "string": {
      return IS_UNSIGNED_INTEGER.test(value);
    }
  }
}
