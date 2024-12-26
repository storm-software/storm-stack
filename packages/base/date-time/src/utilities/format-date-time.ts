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

import { DateInput, format, FormatOptions, type Format } from "@formkit/tempo";
import type { Temporal } from "@js-temporal/polyfill";
import { EMPTY_STRING } from "@storm-stack/types";
import { DEFAULT_DATE_TIME_FORMAT } from "../constants";
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

    /**
     * The format to use when generating the string
     *
     * @remarks
     * For more information read the [Tempo documentation](https://tempo.formkit.com/#format-tokens)
     *
     * @defaultValue "M/D/YYYY h:mm A"
     */
    format?: Format;

    /**
     * The locale used in the formatting
     */
    locale?: string;
  };

/**
 * Format a date time field
 *
 * @param dateTime - The date time to format
 * @param options - The options to use
 * @returns The formatted date time
 */
export const formatDateTime = (
  dateTime?: DateInput | null,
  options: FormatDateTimeOptions = {}
): string => {
  let value = dateTime;

  // const smallestUnit = options?.smallestUnit || "millisecond";
  // const roundingMode = options?.roundingMode || "ceil";
  // const calendarName = options?.calendarName || "never";
  // const timeZoneName = options?.timeZoneName || "never";
  // const offset = options?.offset || "never";

  if (!dateTime && options?.returnEmptyIfNotSet) {
    return EMPTY_STRING;
  }

  if (
    (!dateTime || StormDateTime.validate(dateTime) !== null) &&
    options?.returnEmptyIfInvalid
  ) {
    return EMPTY_STRING;
  }

  if (!dateTime || StormDateTime.validate(dateTime) !== null) {
    value = StormDateTime.current();
  }

  return format({
    date: value,
    format: options.format || DEFAULT_DATE_TIME_FORMAT,
    locale: options.locale,
    tz: StormDateTime.isDateTime(value)
      ? value.timeZoneId
      : StormDateTime.getDefaultTimeZone()
  } as FormatOptions);
};
