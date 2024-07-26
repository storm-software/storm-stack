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
