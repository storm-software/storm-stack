import { Float } from "../utility-types/number";
import { isNumber } from "./is-number";

/**
 * Check if the provided value's type is a float
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `number` and is a float
 */
export const isFloat = <T extends number>(value: T): value is Float<T> =>
  isNumber(value) && value % 1 !== 0;
