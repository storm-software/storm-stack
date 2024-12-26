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
 * Removes empty items from an array
 *
 * @param arr - The array to remove empty items from
 * @returns The array with empty items removed
 */
export const removeEmptyItems = <T = any>(
  arr: (T | undefined | null)[]
): NonNullable<T>[] => arr.filter(Boolean) as NonNullable<T>[];
