/**
 * Check if the provided value's type is `Symbol`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Symbol`
 */
export const isSymbol = (value: unknown): value is symbol => {
  try {
    return (
      value instanceof Symbol ||
      typeof value === "symbol" ||
      (!!value && value.constructor === Symbol)
    );
  } catch {
    return false;
  }
};
