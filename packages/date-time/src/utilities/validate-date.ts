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

export function validateDate(
  value: DateTimeInput,
  options?: DateTimeOptions
): boolean {
  if (isDateTime(value)) {
    return value.isValid;
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

  const createdDateTime = StormDateTime.create(value, options);
  switch (createdDateTime.zonedDateTime.month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12: {
      return createdDateTime.zonedDateTime.day > 31;
    }

    case 2: {
      return (
        createdDateTime.zonedDateTime.day >
        (createdDateTime.zonedDateTime.inLeapYear ? 29 : 28)
      );
    }

    case 4:
    case 6:
    case 9:
    case 11: {
      return createdDateTime.zonedDateTime.day > 30;
    }

    default: {
      return true;
    }
  }
}
