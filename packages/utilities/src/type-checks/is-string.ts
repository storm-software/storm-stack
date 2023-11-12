/**
 * Determine if the type is string
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `string`
 */
export const isString = (value: unknown): value is string => {
  try {
    return typeof value === "string";
  } catch (e) {
    return false;
  }
};
