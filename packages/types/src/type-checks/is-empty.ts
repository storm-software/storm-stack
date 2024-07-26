import { isDate } from "./is-date";
import { isFunction } from "./is-function";
import { isNull } from "./is-null";
import { isNumber } from "./is-number";
import { isSymbol } from "./is-symbol";
import { isUndefined } from "./is-undefined";

/**
 * Check if the provided value's type is `null` or `undefined`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `null` or `undefined`
 */
export const isEmpty = (value: unknown) => {
  try {
    return isUndefined(value) || isNull(value);
  } catch {
    return false;
  }
};

export const isEmptyAnything = (value: any) => {
  if (value === true || value === false) return true;
  if (value === null || value === undefined) return true;
  if (isNumber(value)) return value === 0;
  if (isDate(value)) return Number.isNaN(value.getTime());
  if (isFunction(value)) return false;
  if (isSymbol(value)) return false;
  const { length } = value;
  if (isNumber(length)) return length === 0;
  const { size } = value;
  if (isNumber(size)) return size === 0;
  const keys = Object.keys(value).length;
  return keys === 0;
};
