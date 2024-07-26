/**
 * Check if the provided value's type is `null`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `null`
 */
export const isNull = (value: unknown): value is null => {
  try {
    return value === null;
  } catch {
    return false;
  }
};
