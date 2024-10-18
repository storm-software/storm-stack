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
import { StormDate } from "../storm-date";
import type { StormDateTime } from "../storm-date-time";

export type FormatDateOptions = Partial<Temporal.ShowCalendarOption> & {
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
 * Format a date field
 *
 * @param dateTime - The date time to format
 * @returns The formatted date
 */
export const formatDate = (
  dateTime?: StormDateTime | null,
  options?: FormatDateOptions
): string => {
  let value = dateTime;

  const calendarName = options?.calendarName || "never";
  if (!dateTime && options?.returnEmptyIfNotSet) {
    return "";
  }

  if ((!dateTime || !dateTime.isValid) && options?.returnEmptyIfInvalid) {
    return "";
  }

  if (!dateTime || !dateTime.isValid) {
    value = StormDate.current();
  }

  return value!.zonedDateTime.toPlainDate().toString({
    calendarName
  });
};
