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

import type { Temporal } from "@js-temporal/polyfill";
import { EMPTY_STRING } from "@storm-stack/types";
import type { StormDateTime } from "../storm-date-time";

/**
 * Format a date time field into ISO format
 *
 * @param dateTime - The date time to format
 * @param options - The options to use
 * @returns The formatted date time
 */
export const formatDateTimeISO = (
  dateTime?: StormDateTime | null,
  options?: Partial<Temporal.ZonedDateTimeToStringOptions>
): string => {
  const smallestUnit = options?.smallestUnit || "millisecond";
  const roundingMode = options?.roundingMode || "ceil";
  const calendarName = options?.calendarName || "never";
  const timeZoneName = options?.timeZoneName || "never";
  const offset = options?.offset || "never";

  return dateTime
    ? `${dateTime.instant
        .toZonedDateTimeISO(dateTime.timeZoneId ?? process.env.TZ ?? "UTC")
        .toString({
          smallestUnit,
          roundingMode,
          calendarName,
          timeZoneName,
          offset
        })}`
    : EMPTY_STRING;
};
