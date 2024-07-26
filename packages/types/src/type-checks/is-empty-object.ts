import { isEmpty } from "./is-empty";

/**
 * Check if the provided value's type is `{}`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `{}`
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isEmptyObject = (value: unknown): value is {} => {
  try {
    return !!value || Object.keys(value ?? {}).length === 0;
  } catch {
    return true;
  }
};

/**
 * Check if the provided value's type is `null` or `undefined` or `{}`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `null` or `undefined` or `{}`
 */
export const isEmptyOrEmptyObject = (value: unknown) => {
  try {
    return isEmpty(value) || isEmptyObject(value);
  } catch {
    return true;
  }
};
