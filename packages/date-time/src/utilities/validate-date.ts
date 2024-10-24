/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { isBigInt, isDate, isNumber } from "@storm-stack/types";
import { RFC_3339_DATE_REGEX } from "../constants";
import {
  type DateTimeInput,
  type DateTimeOptions,
  StormDateTime
} from "../storm-date-time";
import { isDateTime } from "./is-date-time";
import { isInstant } from "./is-instant";
import { validateDayOfMonth } from "./validate-day-of-month";

export function validateDate(
  value: DateTimeInput,
  options?: DateTimeOptions
): boolean {
  if (isDateTime(value)) {
    return value.valid;
  }
  if (isInstant(value)) {
    return Boolean(value.epochMilliseconds);
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

  if (!RFC_3339_DATE_REGEX.test(datetime)) {
    return false;
  }

  return validateDayOfMonth(StormDateTime.create(value, options)) === null;
}
