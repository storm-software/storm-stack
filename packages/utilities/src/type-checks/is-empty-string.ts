import { EMPTY_STRING } from "../types";
import { isString } from "./is-string";

/**
 * Determine if the type is string and is empty
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `""`
 */
export const isEmptyString = (value: unknown): value is string => {
  try {
    return isString(value) && value === EMPTY_STRING;
  } catch (e) {
    return false;
  }
};
