import { isEmpty } from "./is-empty";
import { isEmptyObject } from "./is-empty-object";
import { isEmptyString } from "./is-empty-string";

/**
 * The inverse of the `isEmptyObject` function
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is **NOT** of type `null` or `undefined` or `{}`
 */
export const isNotEmpty = (value: unknown): value is NonNullable<unknown> => {
  try {
    return !isEmpty(value) && !isEmptyString(value) && !isEmptyObject(value);
  } catch (e) {
    return false;
  }
};
