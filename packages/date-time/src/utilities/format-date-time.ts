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
import { StormDateTime } from "../storm-date-time";

export type FormatDateTimeOptions =
  Partial<Temporal.ZonedDateTimeToStringOptions> & {
    /**
     * Should an empty string be returned if the date is null or undefined
     *
     * @defaultValue false
     */
    returnEmptyIfNotSet?: boolean;

    /**
     * Should an empty string be returned if the date is invalid
     *
     * @defaultValue false
     */
    returnEmptyIfInvalid?: boolean;
  };

/**
 * Format a date time field
 *
 * @param dateTime - The date time to format
 * @param options - The options to use
 * @returns The formatted date time
 */
export const formatDateTime = (
  dateTime?: StormDateTime | null,
  options?: FormatDateTimeOptions
): string => {
  let value = dateTime;

  const smallestUnit = options?.smallestUnit || "millisecond";
  const roundingMode = options?.roundingMode || "ceil";
  const calendarName = options?.calendarName || "never";
  const timeZoneName = options?.timeZoneName || "never";
  const offset = options?.offset || "never";

  if (!dateTime && options?.returnEmptyIfNotSet) {
    return EMPTY_STRING;
  }

  if ((!dateTime || !dateTime.isValid) && options?.returnEmptyIfInvalid) {
    return EMPTY_STRING;
  }

  if (!dateTime || !dateTime.isValid) {
    value = StormDateTime.current();
  }

  return value!.zonedDateTime
    .toString({
      smallestUnit,
      roundingMode,
      calendarName,
      timeZoneName,
      offset
    })
    .replaceAll("T", " ");
};
