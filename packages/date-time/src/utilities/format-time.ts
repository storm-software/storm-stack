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

import { format, type Format } from "@formkit/tempo";
import type { Temporal } from "@js-temporal/polyfill";
import { EMPTY_STRING } from "@storm-stack/types/utility-types/base";
import { DEFAULT_TIME_FORMAT } from "../constants";
import type { StormDateTime } from "../storm-date-time";
import { StormTime } from "../storm-time";

export type FormatTimeOptions = Partial<Temporal.ToStringPrecisionOptions> & {
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

  /**
   * The format to use when generating the string
   *
   * @remarks
   * For more information read the [Tempo documentation](https://tempo.formkit.com/#format-tokens)
   *
   * @defaultValue "h:mm A"
   */
  format?: Format;

  /**
   * The locale used in the formatting
   */
  locale?: string;
};

/**
 * Format a time field
 *
 * @param dateTime - The date time to format
 * @returns The formatted time string
 */
export const formatTime = (
  dateTime?: StormDateTime | null,
  options: FormatTimeOptions = {}
): string => {
  let value = dateTime;

  // const smallestUnit = options?.smallestUnit || "milliseconds";
  // const roundingMode = options?.roundingMode || "ceil";

  if (!dateTime && options?.returnEmptyIfNotSet) {
    return EMPTY_STRING;
  }

  if ((!dateTime || !dateTime.isValid) && options?.returnEmptyIfInvalid) {
    return EMPTY_STRING;
  }

  if (!dateTime || !dateTime.isValid) {
    value = StormTime.current();
  }

  return format({
    date: value,
    format: options.format || DEFAULT_TIME_FORMAT,
    locale: options.locale,
    tz: value!.timeZoneId
  });
};
