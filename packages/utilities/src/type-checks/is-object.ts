import { isPlainObject } from "./is-plain-object";

/**
 * Check if the provided value's type is `Object`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Object`
 */
export const isObject = (value: unknown): value is object => {
  try {
    return (
      typeof value === "object" ||
      (!!value && value.constructor === Object) ||
      isPlainObject(value)
    );
  } catch (e) {
    return false;
  }
};
