/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

/**
 * The various types of date formats used in Storm Stack applications.
 */
export interface DateFormats<TFormatToken = string> {
  /**
   * Localized full date
   *
   * @example "Jan 1, 2019"
   */
  fullDate: TFormatToken;

  /**
   * Partially localized full date with weekday, useful for text-to-speech accessibility
   *
   * @example "Tuesday, January 1, 2019"
   */
  fullDateWithWeekday: TFormatToken;

  /**
   * Date format string with month and day of month
   *
   * @example "1 January"
   */
  normalDate: TFormatToken;

  /**
   * Date format string with weekday, month and day of month
   *
   * @example "Wed, Jan 1"
   */
  normalDateWithWeekday: TFormatToken;

  /**
   * Shorter day format
   *
   * @example "Jan 1"
   */
  shortDate: TFormatToken;

  /**
   * Year format string
   *
   * @example "2019"
   */
  year: TFormatToken;

  /**
   * Month format string
   *
   * @example "January"
   */
  month: TFormatToken;

  /**
   * Short month format string
   *
   * @example "Jan"
   */
  monthShort: TFormatToken;

  /**
   * Month with year format string
   *
   * @example "January 2018"
   */
  monthAndYear: TFormatToken;

  /**
   * Month with date format string
   *
   * @example "January 1"
   */
  monthAndDate: TFormatToken;

  /**
   * Weekday format string
   *
   * @example "Wednesday"
   */
  weekday: TFormatToken;

  /**
   * Short weekday format string
   *
   * @example "Wed"
   */
  weekdayShort: TFormatToken;

  /**
   * Day format string
   *
   * @example "1"
   */
  dayOfMonth: TFormatToken;

  /**
   * Hours format string
   *
   * @example "11"
   */
  hours12h: TFormatToken;

  /**
   * Hours format string
   *
   * @example "23"
   */
  hours24h: TFormatToken;

  /**
   * Minutes format string
   *
   * @example "44"
   */
  minutes: TFormatToken;

  /**
   * Seconds format string
   *
   * @example "00"
   */
  seconds: TFormatToken;

  /**
   * Full time localized format string
   *
   * @example "11:44 PM" for US, "23:44" for Europe
   */
  fullTime: TFormatToken;

  /**
   * Not localized full time format string
   *
   * @example "11:44 PM"
   */
  fullTime12h: TFormatToken;

  /**
   * Not localized full time format string
   *
   * @example "23:44"
   */
  fullTime24h: TFormatToken;

  /**
   * Date & time format string with localized time
   *
   * @example "Jan 1, 2018 11:44 PM"
   */
  fullDateTime: TFormatToken;

  /**
   * Not localized date & Time format 12h
   *
   * @example "Jan 1, 2018 11:44 PM"
   */
  fullDateTime12h: TFormatToken;

  /**
   * Not localized date & Time format 24h
   *
   * @example "Jan 1, 2018 23:44"
   */
  fullDateTime24h: TFormatToken;

  /**
   * Localized keyboard input friendly date format
   *
   * @example "02/13/2020"
   */
  keyboardDate: TFormatToken;

  /**
   * Localized keyboard input friendly date/time format
   *
   * @example "02/13/2020 23:44"
   */
  keyboardDateTime: TFormatToken;

  /**
   * Partially localized keyboard input friendly date/time 12h format
   *
   * @example "02/13/2020 11:44 PM"
   */
  keyboardDateTime12h: TFormatToken;

  /**
   * Partially localized keyboard input friendly date/time 24h format
   *
   * @example "02/13/2020 23:44"
   */
  keyboardDateTime24h: TFormatToken;

  /**
   * System-friendly date/time 24h format for scenarios such as traces and logging
   *
   * @example "02/13/2020 23:44:55.666"
   */
  systemDateTime: TFormatToken;

  /**
   * System-friendly date/time format for scenarios such as file suffixes or URLs
   *
   * @example "02-13-2020_23-44-55-666"
   */
  filePathDateTime: TFormatToken;
}

/**
 * Represents the time unit types used in date manipulation.
 *
 * @remarks
 * This type is used to specify the unit of time when performing operations like adding or subtracting time from a date.
 */
export type TimeUnit =
  | "years"
  | "quarters"
  | "months"
  | "weeks"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

// interface ConstructorOptions<TLocale> {
//   formats?: Partial<DateFormats>;
//   locale?: TLocale;
//   instance?: any;
// }

/**
 * Interface for date utility functions used in the Storm Stack.
 *
 * @typeParam TDate - The date object type used by the underlying date library.
 * @typeParam TLocale - The locale type used by the underlying date library.
 *
 * @remarks
 * This interface defines a contract for date manipulation and formatting utilities, abstracting over different date libraries (such as [Moment.js](https://momentjs.com/), [Day.js](https://day.js.org/), etc.). It provides methods for creating, parsing, comparing, and formatting dates, as well as manipulating date components and handling localization.
 */
export interface StormDateInterface<TDate, TLocale> {
  /**
   * The set of date formats supported by the utility.
   */
  formats: DateFormats<any>;

  /**
   * The current locale object, if available.
   */
  locale?: TLocale;

  /**
   * The [Moment.js](https://momentjs.com/) instance, if using [Moment.js](https://momentjs.com/) as the underlying library.
   */
  moment?: any;

  /**
   * The [Day.js](https://day.js.org/) instance, if using [Day.js](https://day.js.org/) as the underlying library.
   */
  dayjs?: any;

  /**
   * Name of the currently used date library.
   */
  type: string;

  /**
   * Create a new `Date` object with the underlying library.
   *
   * @remarks
   * This method supports some of the standard input sources like ISO strings so you can pass the string directly as `date("2024-01-10T14:30:00Z")`, and javascript `Date` objects `date(new Date())`. If `null` is passed `null` will be returned.
   *
   * @param value - The value to create a date object from. Can be a string, number, or JavaScript Date object.
   * @returns A date object of type `TDate` or `null` if the input is `null`.
   */
  createDate: <
    TArg = undefined,
    TResultingDate = TArg extends null
      ? null
      : TArg extends undefined
        ? TDate
        : TDate | null
  >(
    value?: TArg
  ) => TResultingDate;

  /**
   * Creates a date object from a JavaScript Date object.
   *
   * @remarks
   * This method is used to create a date object from a JavaScript Date object. It is useful for converting JavaScript Date objects to the date library's date objects.
   */
  toJsDate: (value: TDate) => Date;

  /**
   * Creates a date object from an ISO string.
   *
   * @remarks
   * This method is used to create a date object from an ISO string. It is useful for parsing dates from strings.
   */
  parseISO: (isString: string) => TDate;

  /**
   * Converts a date object to an ISO string.
   *
   * @remarks
   * This method is used to convert a date object to an ISO string. It is useful for serializing dates to strings.
   */
  toISO: (value: TDate) => string;

  /**
   * Creates a date object from a string using the specified format.
   *
   * @remarks
   * This method is used to create a date object from a string using the specified format. It is useful for parsing dates from strings with custom formats.
   */
  parse: (value: string, format: string) => TDate | null;

  /**
   * Returns the current locale code.
   *
   * @returns The current locale code.
   */
  getCurrentLocaleCode: () => string;

  /**
   * Returns an indicator if the current locale is using a 12-hour cycle.
   *
   * @returns `true` if the current locale is using a 12-hour cycle, otherwise `false`.
   */
  is12HourCycleInCurrentLocale: () => boolean;

  /**
   * Returns user readable format (taking into account localized format tokens), useful to render helper text for input (e.g. placeholder). If helper can not be created and for [Luxon](https://moment.github.io/luxon/#/) always returns empty string.
   *
   * @param format - The format string to use.
   * @returns The user readable format string.
   */
  getFormatHelperText: (format: string) => string;

  /**
   * Checks if the value is null.
   *
   * @param value - The value to check.
   * @returns `true` if the value is null, otherwise `false`.
   */
  isNull: (value: TDate | null) => boolean;

  /**
   * Checks if the value is valid.
   *
   * @param value - The value to check.
   * @returns `true` if the value is valid, otherwise `false`.
   */
  isValid: (value: any) => boolean;

  /**
   * Returns the difference between two dates.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @param unit - The unit of time to use for the comparison.
   * @returns The difference between the two dates in the specified unit.
   */
  getDiff: (value: TDate, comparing: TDate | string, unit?: TimeUnit) => number;

  /**
   * Checks if two values are equal.
   *
   * @param value - The first value to compare.
   * @param comparing - The second value to compare.
   * @returns `true` if the two values are equal, otherwise `false`.
   */
  isEqual: (value: any, comparing: any) => boolean;

  /**
   * Checks if two dates are the same day.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the two dates are the same day, otherwise `false`.
   */
  isSameDay: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are the same month.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the two dates are the same month, otherwise `false`.
   */
  isSameMonth: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are the same year.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the two dates are the same year, otherwise `false`.
   */
  isSameYear: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are the same hour.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the two dates are the same hour, otherwise `false`.
   */
  isSameHour: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are after each other.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is after the second date, otherwise `false`.
   */
  isAfter: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are after each other on the same day.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is after the second date on the same day, otherwise `false`.
   */
  isAfterDay: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are after each other on the same month.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is after the second date on the same month, otherwise `false`.
   */
  isAfterMonth: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are after each other on the same year.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is after the second date on the same year, otherwise `false`.
   */
  isAfterYear: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are before each other.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is before the second date, otherwise `false`.
   */
  isBefore: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are before each other on the same day.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is before the second date on the same day, otherwise `false`.
   */
  isBeforeDay: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are before each other on the same month.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is before the second date on the same month, otherwise `false`.
   */
  isBeforeMonth: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if two dates are before each other on the same year.
   *
   * @param value - The first date to compare.
   * @param comparing - The second date to compare.
   * @returns `true` if the first date is before the second date on the same year, otherwise `false`.
   */
  isBeforeYear: (value: TDate, comparing: TDate) => boolean;

  /**
   * Checks if a date is within a specific range.
   *
   * @param value - The date to check.
   * @param range - The range to check against.
   * @returns `true` if the date is within the range, otherwise `false`.
   */
  isWithinRange: (value: TDate, range: [TDate, TDate]) => boolean;

  /**
   * Gets the start of the year for a given date.
   *
   * @param value - The date to get the start of the year for.
   * @returns The start of the year for the given date.
   */
  startOfYear: (value: TDate) => TDate;

  /**
   * Gets the end of the year for a given date.
   *
   * @param value - The date to get the end of the year for.
   * @returns The end of the year for the given date.
   */
  endOfYear: (value: TDate) => TDate;

  /**
   * Gets the start of the month for a given date.
   *
   * @param value - The date to get the start of the month for.
   * @returns The start of the month for the given date.
   */
  startOfMonth: (value: TDate) => TDate;

  /**
   * Gets the end of the month for a given date.
   *
   * @param value - The date to get the end of the month for.
   * @returns The end of the month for the given date.
   */
  endOfMonth: (value: TDate) => TDate;

  /**
   * Gets the start of the week for a given date.
   *
   * @param value - The date to get the start of the week for.
   * @returns The start of the week for the given date.
   */
  startOfWeek: (value: TDate) => TDate;

  /**
   * Gets the end of the week for a given date.
   *
   * @param value - The date to get the end of the week for.
   * @returns The end of the week for the given date.
   */
  endOfWeek: (value: TDate) => TDate;

  /**
   * Adds a specified number of seconds to a date.
   *
   * @param value - The date to add seconds to.
   * @param count - The number of seconds to add.
   * @returns The new date with the seconds added.
   */
  addSeconds: (value: TDate, count: number) => TDate;

  /**
   * Adds a specified number of minutes to a date.
   *
   * @param value - The date to add minutes to.
   * @param count - The number of minutes to add.
   * @returns The new date with the minutes added.
   */
  addMinutes: (value: TDate, count: number) => TDate;

  /**
   * Adds a specified number of hours to a date.
   *
   * @param value - The date to add hours to.
   * @param count - The number of hours to add.
   * @returns The new date with the hours added.
   */
  addHours: (value: TDate, count: number) => TDate;

  /**
   * Adds a specified number of days to a date.
   *
   * @param value - The date to add days to.
   * @param count - The number of days to add.
   * @returns The new date with the days added.
   */
  addDays: (value: TDate, count: number) => TDate;

  /**
   * Adds a specified number of weeks to a date.
   *
   * @param value - The date to add weeks to.
   * @param count - The number of weeks to add.
   * @returns The new date with the weeks added.
   */
  addWeeks: (value: TDate, count: number) => TDate;

  /**
   * Adds a specified number of months to a date.
   *
   * @param value - The date to add months to.
   * @param count - The number of months to add.
   * @returns The new date with the months added.
   */
  addMonths: (value: TDate, count: number) => TDate;

  /**
   * Adds a specified number of years to a date.
   *
   * @param value - The date to add years to.
   * @param count - The number of years to add.
   * @returns The new date with the years added.
   */
  addYears: (value: TDate, count: number) => TDate;

  /**
   * Gets the start of the day for a given date.
   *
   * @param value - The date to get the start of the day for.
   * @returns The start of the day for the given date.
   */
  startOfDay: (value: TDate) => TDate;

  /**
   * Gets the end of the day for a given date.
   *
   * @param value - The date to get the end of the day for.
   * @returns The end of the day for the given date.
   */
  endOfDay: (value: TDate) => TDate;

  /**
   * Formats a date using a predefined format key.
   *
   * @param value - The date to format.
   * @param formatKey - The key of the format to use.
   * @returns The formatted date string.
   */
  format: (value: TDate, formatKey: keyof DateFormats) => string;

  /**
   * Formats a date using a custom format string.
   *
   * @param value - The date to format.
   * @param formatString - The format string to use.
   * @returns The formatted date string.
   */
  formatByString: (value: TDate, formatString: string) => string;

  /**
   * Formats a number as a string, possibly applying localization.
   *
   * @param numberToFormat - The number string to format.
   * @returns The formatted number string.
   */
  formatNumber: (numberToFormat: string) => string;

  /**
   * Gets the hours component of a date.
   *
   * @param value - The date to extract hours from.
   * @returns The hours component.
   */
  getHours: (value: TDate) => number;

  /**
   * Sets the hours component of a date.
   *
   * @param value - The date to set hours on.
   * @param count - The hours value to set.
   * @returns The new date with the hours set.
   */
  setHours: (value: TDate, count: number) => TDate;

  /**
   * Gets the minutes component of a date.
   *
   * @param value - The date to extract minutes from.
   * @returns The minutes component.
   */
  getMinutes: (value: TDate) => number;

  /**
   * Sets the minutes component of a date.
   *
   * @param value - The date to set minutes on.
   * @param count - The minutes value to set.
   * @returns The new date with the minutes set.
   */
  setMinutes: (value: TDate, count: number) => TDate;

  /**
   * Gets the seconds component of a date.
   *
   * @param value - The date to extract seconds from.
   * @returns The seconds component.
   */
  getSeconds: (value: TDate) => number;

  /**
   * Sets the seconds component of a date.
   *
   * @param value - The date to set seconds on.
   * @param count - The seconds value to set.
   * @returns The new date with the seconds set.
   */
  setSeconds: (value: TDate, count: number) => TDate;

  /**
   * Gets the day of the month from a date.
   *
   * @param value - The date to extract the day from.
   * @returns The day of the month.
   */
  getDate: (value: TDate) => number;

  /**
   * Sets the day of the month on a date.
   *
   * @param value - The date to set the day on.
   * @param count - The day of the month to set.
   * @returns The new date with the day set.
   */
  setDate: (value: TDate, count: number) => TDate;

  /**
   * Gets the week number for a given date.
   *
   * @param value - The date to get the week number for.
   * @returns The week number.
   */
  getWeek: (value: TDate) => number;

  /**
   * Gets the month component of a date (0-based).
   *
   * @param value - The date to extract the month from.
   * @returns The month component (0 = January, 11 = December).
   */
  getMonth: (value: TDate) => number;

  /**
   * Gets the number of days in the month for a given date.
   *
   * @param value - The date to get the number of days in the month for.
   * @returns The number of days in the month.
   */
  getDaysInMonth: (value: TDate) => number;

  /**
   * Sets the month component of a date (0-based).
   *
   * @param value - The date to set the month on.
   * @param count - The month to set (0 = January, 11 = December).
   * @returns The new date with the month set.
   */
  setMonth: (value: TDate, count: number) => TDate;

  /**
   * Gets the date representing the next month.
   *
   * @param value - The date to get the next month for.
   * @returns The date in the next month.
   */
  getNextMonth: (value: TDate) => TDate;

  /**
   * Gets the date representing the previous month.
   *
   * @param value - The date to get the previous month for.
   * @returns The date in the previous month.
   */
  getPreviousMonth: (value: TDate) => TDate;

  /**
   * Gets an array of dates representing each month in the year of the given date.
   *
   * @param value - The date to get the month array for.
   * @returns An array of dates, one for each month.
   */
  getMonthArray: (value: TDate) => TDate[];

  /**
   * Gets the year component of a date.
   *
   * @param value - The date to extract the year from.
   * @returns The year component.
   */
  getYear: (value: TDate) => number;

  /**
   * Sets the year component of a date.
   *
   * @param value - The date to set the year on.
   * @param count - The year to set.
   * @returns The new date with the year set.
   */
  setYear: (value: TDate, count: number) => TDate;

  /**
   * Merges the date part of one date with the time part of another date.
   *
   * @param date - The date to take the date part from.
   * @param time - The date to take the time part from.
   * @returns The merged date and time.
   */
  mergeDateAndTime: (date: TDate, time: TDate) => TDate;

  /**
   * Gets the names of the weekdays in the current locale.
   *
   * @returns An array of weekday names.
   */
  getWeekdays: () => string[];

  /**
   * Gets a 2D array representing the weeks in the month of the given date.
   *
   * @param date - The date to get the week array for.
   * @returns A 2D array of dates, grouped by week.
   */
  getWeekArray: (date: TDate) => TDate[][];

  /**
   * Gets an array of dates representing the range of years between two dates.
   *
   * @param start - The start date of the range.
   * @param end - The end date of the range.
   * @returns An array of dates, one for each year in the range.
   */
  getYearRange: (start: TDate, end: TDate) => TDate[];

  /**
   * Gets the localized string for "am" or "pm".
   *
   * @param meridiem - Either "am" or "pm".
   * @returns The localized meridiem string.
   */
  getMeridiemText: (meridiem: "am" | "pm") => string;
}
