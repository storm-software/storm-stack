/**
 * Removes empty items from an array
 *
 * @param arr - The array to remove empty items from
 * @returns The array with empty items removed
 */
export const removeEmptyItems = <T = any>(
  arr: Array<T | undefined | null>
): NonNullable<T>[] => arr.filter(Boolean) as NonNullable<T>[];
