type Order = "asc" | "desc";

/**
 * Sorts an array of objects based on multiple properties and their corresponding order directions.
 *
 * @remarks
 * This function takes an array of objects, an array of keys to sort by, and an array of order directions.
 * It returns the sorted array, ordering by each key according to its corresponding direction
 * ('asc' for ascending or 'desc' for descending). If values for a key are equal,
 * it moves to the next key to determine the order.
 *
 * @example
 * ```typescript
 * // Sort an array of objects by 'user' in ascending order and 'age' in descending order.
 * const users = [
 *   { user: 'fred', age: 48 },
 *   { user: 'barney', age: 34 },
 *   { user: 'fred', age: 40 },
 *   { user: 'barney', age: 36 },
 * ];
 * const result = orderBy(users, ['user', 'age'], ['asc', 'desc']);
 * // result will be:
 * // [
 * //   { user: 'barney', age: 36 },
 * //   { user: 'barney', age: 34 },
 * //   { user: 'fred', age: 48 },
 * //   { user: 'fred', age: 40 },
 * // ]
 * ```
 *
 * @param collection - The array of objects to be sorted.
 * @param keys - An array of keys (properties) by which to sort.
 * @param orders - An array of order directions ('asc' for ascending or 'desc' for descending).
 * @returns The sorted array.
 */
export function getOrderedBy<T>(
  collection: T[],
  keys: Array<keyof T>,
  orders: Order[]
): T[] {
  const compareValues = (a: T[keyof T], b: T[keyof T], order: Order) => {
    if (a < b) {
      return order === "asc" ? -1 : 1;
    }
    if (a > b) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  };

  const effectiveOrders = keys.map(
    (_, index) => orders[index] || orders.at(-1)
  );

  return [...collection].sort((a, b) => {
    for (const [i, key] of keys.entries()) {
      const order = effectiveOrders[i];
      const result = compareValues(a[key], b[key], order!);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  });
}
