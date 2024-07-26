/**
 * Check if the provided value's type is a built-in primitive
 *
 * @remarks
 * The full list of primitive types includes:
 * * `number`
 * * `string`
 * * `boolean`
 * * `symbol`
 * * `bigint`
 * * `undefined`
 * * `null`
 *
 * @param obj - The value to type check
 * @returns An indicator specifying if the value provided is a built-in primitive
 */
export const isPrimitive = (value: unknown): boolean => {
  try {
    return (
      value === undefined ||
      value === null ||
      (typeof value !== "object" && typeof value !== "function")
    );
  } catch {
    return false;
  }
};
