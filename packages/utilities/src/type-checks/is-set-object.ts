import { isEmptyOrEmptyObject } from "./is-empty-object";
import { isObject } from "./is-object";

/**
 * Check if the provided value's type is NOT `null` nor `undefined` nor `{}`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is NOT `null` nor `undefined` nor `{}`
 */
export const isSetObject = (value: unknown): value is NonNullable<object> => {
  try {
    return (
      !isEmptyOrEmptyObject(value) &&
      isObject(value) &&
      Object.keys(value).length > 0
    );
  } catch (e) {
    return true;
  }
};
