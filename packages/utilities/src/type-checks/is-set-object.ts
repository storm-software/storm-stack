import { isEmptyOrEmptyObject } from "./is-empty-object";

/**
 * Check if the provided value's type is NOT `null` nor `undefined` nor `{}`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is NOT `null` nor `undefined` nor `{}`
 */
export const isSetObject = (value: unknown): value is NonNullable<object> => {
  try {
    return isEmptyOrEmptyObject(value);
  } catch (e) {
    return true;
  }
};
