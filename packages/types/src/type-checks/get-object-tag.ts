/**
 * Gets the `toStringTag` of `obj`.
 *
 * @param value - The obj to query.
 * @returns Returns the `toStringTag`.
 */
export const getObjectTag = (value: unknown): string => {
  if (value == null) {
    return value === undefined ? "[object Undefined]" : "[object Null]";
  }
  return Object.prototype.toString.call(value);
};
