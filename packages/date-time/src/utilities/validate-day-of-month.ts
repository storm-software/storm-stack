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

import { ValidationDetails } from "@storm-stack/types";
import { MessageType } from "@storm-stack/types/utility-types/messages";
import { DateTimeErrorCode } from "../errors";
import { StormDateTime } from "../storm-date-time";

/**
 * Validates the day of the month
 *
 * @param value - The StormDateTime value to validate
 * @returns A ValidationDetails object if invalid, null if valid
 */
export const validateDayOfMonth = (
  value: StormDateTime
): ValidationDetails | null => {
  switch (value.zonedDateTime.month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11: {
      if (value.zonedDateTime.day > 31) {
        return {
          code: DateTimeErrorCode.invalid_day_of_month,
          type: MessageType.ERROR
        };
      }

      break;
    }

    case 1: {
      if (
        value.zonedDateTime.day > (value.zonedDateTime.inLeapYear ? 29 : 28)
      ) {
        return {
          code: DateTimeErrorCode.invalid_day_of_month,
          type: MessageType.ERROR
        };
      }

      break;
    }

    case 3:
    case 5:
    case 8:
    case 10: {
      if (value.zonedDateTime.day > 30) {
        return {
          code: DateTimeErrorCode.invalid_day_of_month,
          type: MessageType.ERROR
        };
      }

      break;
    }

    default: {
      break;
    }
  }

  // Success - Valid
  return null;
};
