import { ITyped } from "../types";
import { isObject } from "./is-object";
import { isSet } from "./is-set";

/**
 * Check if the provided value has a `__typename` property
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided has a `__typename` property
 */
export const isTyped = (value: unknown): value is ITyped => {
  try {
    return isSet(value) && isObject(value) && "__typename" in value;
  } catch (e) {
    return false;
  }
};
