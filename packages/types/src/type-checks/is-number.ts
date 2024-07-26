import { AnyNumber } from "../utility-types/base";
import { getObjectTag } from "./get-object-tag";

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
  } catch {
    return false;
  }
};

/**
 * Check if the provided value's type is `AnyNumber`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `AnyNumber`
 */
export function isAnyNumber(value?: any): value is AnyNumber {
  return isNumber(value) || getObjectTag(value) === "[object Number]";
}
