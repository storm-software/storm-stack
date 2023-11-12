import { isNull } from "./is-null";
import { isUndefined } from "./is-undefined";

/**
 * Check if the provided value's type is `null` or `undefined`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `null` or `undefined`
 */
export const isEmpty = (value: unknown) => {
  try {
    return isUndefined(value) || isNull(value);
  } catch (e) {
    return false;
  }
};
