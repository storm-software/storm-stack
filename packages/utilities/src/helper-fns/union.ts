/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://docs.stormsoftware.com/projects/storm-stack
 Contact:         https://stormsoftware.com/contact
 Licensing:       https://stormsoftware.com/licensing

 -------------------------------------------------------------------*/

import { getUnique } from "./get-unique";

/**
 * Creates an array of unique values from all given arrays.
 *
 * @remarks
 * This function takes two arrays, merges them into a single array, and returns a new array
 * containing only the unique values from the merged array.
 *
 * @example
 * ```ts
 * const array1 = [1, 2, 3];
 * const array2 = [3, 4, 5];
 * const result = union(array1, array2);
 * // result will be [1, 2, 3, 4, 5]
 * ```
 *
 * @param arr1 - The first array to merge and filter for unique values.
 * @param arr2 - The second array to merge and filter for unique values.
 * @returns A new array of unique values.
 */
export function union<T>(arr1: readonly T[], arr2: readonly T[]): T[] {
  return getUnique([...arr1, ...arr2]);
}
