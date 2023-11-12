import { isEmpty } from "./is-empty";

/**
 * The inverse of the `isEmpty` function
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is **NOT** of type `null` or `undefined`
 */
export const isSet = (value: unknown): value is NonNullable<unknown> => {
  try {
    return !isEmpty(value);
  } catch (e) {
    return false;
  }
};
