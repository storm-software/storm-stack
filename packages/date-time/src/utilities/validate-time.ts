import { isBigInt } from "@storm-stack/utilities/type-checks/is-bigint";
import { isDate } from "@storm-stack/utilities/type-checks/is-date";
import { isNumber } from "@storm-stack/utilities/type-checks/is-number";
import { RFC_3339_TIME_REGEX } from "../constants";
import { DateTimeInput, DateTimeOptions } from "../storm-date-time";
import { isDateTime } from "./is-date-time";
import { isInstant } from "./is-instant";

export function validateTime(
  value?: DateTimeInput,
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

  return RFC_3339_TIME_REGEX.test(datetime);
}
