/**
 * Check if the provided value's type is `undefined`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `undefined`
 */
export const isUndefined = (value: unknown) => {
  try {
    return value === undefined;
  } catch (e) {
    return false;
  }
};
