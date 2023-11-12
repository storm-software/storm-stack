/**
 * Check if the provided value's type is `number`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `number`
 */
export const isNumber = (value: unknown): value is number => {
  try {
    return (
      value instanceof Number ||
      typeof value === "number" ||
      Number(value) === value
    );
  } catch (e) {
    return false;
  }
};

/**
 * Check if the provided value's type is an integer
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `number` and is an integer
 */
export const isInt = (value: any): value is number => {
  return isNumber(value) && value % 1 === 0;
};

/**
 * Check if the provided value's type is a float
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `number` and is a float
 */
export const isFloat = (value: any): value is number => {
  return isNumber(value) && value % 1 !== 0;
};
