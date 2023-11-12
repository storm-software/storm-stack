import { isSet } from "./is-set";
import { isString } from "./is-string";

/**
 * Determine if the type is string and is not empty (length greater than zero)
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `string` and length greater than zero
 */
export const isSetString = (value: unknown): value is NonNullable<string> => {
  try {
    return isSet(value) && isString(value) && value.length > 0;
  } catch (e) {
    return false;
  }
};
