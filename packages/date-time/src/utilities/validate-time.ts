import { isBigInt, isDate, isNumber } from "@storm-stack/types";
import { RFC_3339_TIME_REGEX } from "../constants";
import type { DateTimeInput, DateTimeOptions } from "../storm-date-time";
import { isDateTime } from "./is-date-time";
import { isInstant } from "./is-instant";

export function validateTime(
  value?: DateTimeInput,
  _options?: DateTimeOptions
): boolean {
  if (isDateTime(value)) {
    return value.isValid;
  }
  if (isInstant(value)) {
    return !!value.epochMilliseconds;
  }

  let datetime: string | undefined;
  if (isDate(value) || isNumber(value) || isBigInt(value)) {
    const date =
      isNumber(value) || isBigInt(value) ? new Date(Number(value)) : value;

    if (Number.isNaN(date.getTime())) {
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

  return RFC_3339_TIME_REGEX.test(datetime);
}
