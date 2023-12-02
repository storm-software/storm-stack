import { isBigInt, isNumber } from "@storm-software/utilities";
import { isDate } from "@storm-software/utilities/type-checks/is-date";
import { RFC_3339_DATETIME_REGEX } from "../constants";
import { DateTimeInput, DateTimeOptions } from "../storm-date-time";
import { isDateTime } from "./is-date-time";
import { isInstant } from "./is-instant";
import { validateDate } from "./validate-date";
import { validateTime } from "./validate-time";

/**
 * Type-check to determine if `value` is a valid *date-time*
 * @param value - The value to check
 * @param options - The options to use
 * @returns A boolean representing whether the value is a valid *date-time*
 */
export function validateDateTime(
  value: DateTimeInput,
  options?: DateTimeOptions
): boolean {
  if (isDateTime(value)) {
    return value.isValid;
  }
  if (isInstant(value)) {
    return !!value.epochMilliseconds;
  }

  let datetime: string | undefined;
  if (isDate(value) || isNumber(value) || isBigInt(value)) {
    let date!: Date;
    if (isNumber(value) || isBigInt(value)) {
      date = new Date(Number(value));
    } else {
      date = value;
    }

    if (isNaN(date.getTime())) {
      return false;
    }

    datetime = date.toUTCString();
  } else {
    datetime =
      value === null || value === void 0 ? void 0 : value.toUpperCase();
  }

  if (!datetime) {
    return false;
  }

  // Validate the structure of the date-string
  if (!RFC_3339_DATETIME_REGEX.test(datetime)) {
    return false;
  }

  // Check if it is a correct date using the javascript Date parse() method.
  if (!Date.parse(datetime)) {
    return false;
  }

  // Split the date-time-string up into the string-date and time-string part.
  // and check whether these parts are RFC 3339 compliant.
  return !!(
    validateDate(datetime.substring(0, datetime.indexOf("T")), options) &&
    validateTime(datetime.substring(datetime.indexOf("T") + 1), options)
  );
}
