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
import { EMPTY_STRING } from "@storm-stack/types/utility-types/base";
import { DEFAULT_DATE_FORMAT } from "../constants";
import { StormDate } from "../storm-date";
import { StormDateTime } from "../storm-date-time";

export type FormatDateOptions = {
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
   * @defaultValue "M/D/YYYY"
   */
  format?: Format;

  /**
   * The locale used in the formatting
   */
  locale?: string;
};

/**
 * Format a date field
 *
 * @param dateTime - The date time to format
 * @returns The formatted date
 */
export const formatDate = (
  dateTime?: DateInput | null,
  options: FormatDateOptions = {}
): string => {
  let value = dateTime;

  if (!dateTime && options.returnEmptyIfNotSet) {
    return EMPTY_STRING;
  }

  if (
    (!dateTime || StormDate.validate(dateTime) !== null) &&
    options.returnEmptyIfInvalid
  ) {
    return EMPTY_STRING;
  }

  if (!dateTime || StormDate.validate(dateTime) !== null) {
    value = StormDate.current();
  }

  return format({
    date: value,
    format: options.format || DEFAULT_DATE_FORMAT,
    locale: options.locale,
    tz: StormDateTime.isDateTime(value)
      ? value.timeZoneId
      : StormDateTime.getDefaultTimeZone()
  } as FormatOptions);
};
