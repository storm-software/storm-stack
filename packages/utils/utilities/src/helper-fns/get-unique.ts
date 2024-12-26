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
 * Returns an array of unique values from the given array.
 *
 * @param arr - The array to get unique values from.
 * @returns An array of unique values.
 */
export const getUnique = <T = any>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

/**
 * Returns a new array containing only the unique elements from the original array,
 * based on the values returned by the mapper function.
 *
 * @example
 * ```ts
 * uniqBy([1.2, 1.5, 2.1, 3.2, 5.7, 5.3, 7.19], Math.floor);
 * // [1.2, 2.1, 3.2, 5.7, 7.19]
 * ```
 *
 * @param arr - The array to process.
 * @param mapper - The function used to convert the array elements.
 * @returns A new array containing only the unique elements from the original array, based on the values returned by the mapper function.
 */
export function getUniqueBy<T, U>(
  arr: readonly T[],
  mapper: (item: T) => U
): T[] {
  const map = new Map<U, T>();

  for (const item of arr) {
    const key = mapper(item);

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return [...map.values()];
}
