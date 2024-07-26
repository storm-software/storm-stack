import { Integer } from "../utility-types/number";
import { isNumber } from "./is-number";
import { isString } from "./is-string";

/**
 * Check if the provided value's type is an integer
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `number` and is an integer
 */
export const isInteger = <T extends number>(value: T): value is Integer<T> =>
  isNumber(value) && !isString(value) && value % 1 === 0;
