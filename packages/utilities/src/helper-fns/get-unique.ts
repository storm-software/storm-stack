/**
 * Returns an array of unique values from the given array.
 *
 * @param arr - The array to get unique values from.
 * @returns An array of unique values.
 */
export const getUnique = <T = any>(arr: T[]): T[] => {
  return [...new Set<T>(arr)];
};
