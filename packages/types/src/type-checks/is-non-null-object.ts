import { isObject } from "./is-object";
import { isSet } from "./is-set";

/**
 * Check if the provided value's type is `Object` and is not `null` or `undefined`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Object` and is not `null` or `undefined`
 */
export const isNonNullObject = (value: any): value is NonNullable<object> => {
  return isSet(value) && isObject(value);
};
