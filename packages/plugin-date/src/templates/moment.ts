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

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import type { Context } from "@storm-stack/core/types/context";

/**
 * Generates the Storm Stack configuration file.
 *
 * @param _context - The build context containing runtime information.
 * @returns A string representing the configuration file content.
 */
export async function MomentModule(_context: Context) {
  return `
/**
 * The Storm Stack date module provides utility functions for date manipulation and formatting
 *
 * @module storm:date
 */

${getFileHeader()}

import defaultMoment, { LongDateFormatKey } from "moment";
import {
  StormDateInterface,
  DateFormats,
  TimeUnit
} from "@storm-stack/types/shared/date";

type Moment = defaultMoment.Moment;

export const formats: DateFormats = {
  normalDateWithWeekday: "ddd, MMM D",
  normalDate: "D MMMM",
  shortDate: "MMM D",
  monthAndDate: "MMMM D",
  dayOfMonth: "D",
  year: "YYYY",
  month: "MMMM",
  monthShort: "MMM",
  monthAndYear: "MMMM YYYY",
  weekday: "dddd",
  weekdayShort: "ddd",
  minutes: "mm",
  hours12h: "hh",
  hours24h: "HH",
  seconds: "ss",
  fullTime: "LT",
  fullTime12h: "hh:mm A",
  fullTime24h: "HH:mm",
  fullDate: "ll",
  fullDateWithWeekday: "dddd, LL",
  fullDateTime: "lll",
  fullDateTime12h: "ll hh:mm A",
  fullDateTime24h: "ll HH:mm",
  keyboardDate: "L",
  keyboardDateTime: "L LT",
  keyboardDateTime12h: "L hh:mm A",
  keyboardDateTime24h: "L HH:mm",
};

export let locale = $storm.config.static.DEFAULT_LOCALE;

export const type = "moment";

const moment = defaultMoment;

/**
 * Creates a date object using the provided value.
 *
 * @remarks
 * This function creates a date object using the provided value. If the value is \`null\`, it returns \`null\`. If the value is \`undefined\`, it returns the current date. If the value is a string, it parses the string as a date. If the value is a number, it treats it as a timestamp. If the value is a date object, it returns the date object.
 *
 * @example
 * \`\`\`ts
 * import { createDate } from "storm:date";
 *
 * const date = createDate("2023-10-01");
 * console.log(date.format("YYYY-MM-DD")); // Outputs: 2023-10-01
 * \`\`\`
 *
 * @param value - The value to create the date object from.
 * @returns A date object or \`null\` if the value is \`null\`.
 */
export function createDate<
  TArg extends unknown = undefined,
  TResultingDate extends unknown = TArg extends null
    ? null
    : TArg extends undefined
    ? defaultMoment.Moment
    : defaultMoment.Moment | null
>(value?: TArg): TResultingDate {
  if (value === null) {
    return null as TResultingDate;
  }

  const _moment = moment(value);
  if (locale) {
    _moment.locale(locale);
  }

  return _moment as TResultingDate;
}


export function is12HourCycleInCurrentLocale(): boolean {
  return /A|a/.test(
    moment.localeData(getCurrentLocaleCode()).longDateFormat("LT")
  );
};

export function getFormatHelperText(format: string) {
  // @see https://github.com/moment/moment/blob/develop/src/lib/format/format.js#L6
  const localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})|./g;

  return (
    format
      .match(localFormattingTokens)
      ?.map((token) => {
        const firstCharacter = token[0];
        if (firstCharacter === "L" || firstCharacter === ";") {
          return moment
            .localeData(getCurrentLocaleCode())
            .longDateFormat(token as LongDateFormatKey);
        }

        return token;
      })
      .join("")
      .replace(/a/gi, "(a|p)m")
      .toLocaleLowerCase() ?? format
  );
};

export function getCurrentLocaleCode() {
  return locale || moment.locale();
};

export function parseISO(isoString: string) {
  return moment(isoString, true);
};

export function toISO(value: Moment) {
  return value.toISOString();
};

export function parse(value: string, format: string) {
  if (value === "") {
    return null;
  }

  if (locale) {
    return moment(value, format, locale, true);
  }

  return moment(value, format, true);
};

export function toJsDate(value: Moment) {
  return value.toDate();
};

export function isValid(value: any) {
  return moment(value).isValid();
};

export function isNull(date: Moment) {
  return date === null;
};

export function getDiff(date: Moment, comparing: Moment | string, unit?: TimeUnit) {
  if (!moment(comparing).isValid()) {
    return 0;
  }

  return date.diff(comparing, unit);
};

export function isAfter(date: Moment, value: Moment) {
  return date.isAfter(value);
};

export function isBefore(date: Moment, value: Moment) {
  return date.isBefore(value);
};

export function isAfterDay(date: Moment, value: Moment) {
  return date.isAfter(value, "day");
};

export function isBeforeDay(date: Moment, value: Moment) {
  return date.isBefore(value, "day");
};

export function isBeforeMonth(date: Moment, value: Moment) {
  return date.isBefore(value, "month");
};

export function isAfterMonth(date: Moment, value: Moment) {
  return date.isAfter(value, "month");
};

export function isBeforeYear(date: Moment, value: Moment) {
  return date.isBefore(value, "year");
};

export function isAfterYear(date: Moment, value: Moment) {
  return date.isAfter(value, "year");
};

export function startOfDay(date: Moment) {
  return date.clone().startOf("day");
};

export function endOfDay(date: Moment) {
  return date.clone().endOf("day");
};

export function format(date: Moment, formatKey: keyof DateFormats) {
  return formatByString(date, formats[formatKey]);
};

export function formatByString(date: Moment, formatString: string) {
  const clonedDate = date.clone();
  if (locale) {
    clonedDate.locale(locale);
  }
  return clonedDate.format(formatString);
};

export function formatNumber(numberToFormat: string) {
  return numberToFormat;
};

export function getHours(date: Moment) {
  return date.get("hours");
};

export function addSeconds(date: Moment, count: number) {
  return count < 0
    ? date.clone().subtract(Math.abs(count), "seconds")
    : date.clone().add(count, "seconds");
};

export function addMinutes(date: Moment, count: number) {
  return count < 0
    ? date.clone().subtract(Math.abs(count), "minutes")
    : date.clone().add(count, "minutes");
};

export function addHours(date: Moment, count: number) {
  return count < 0
    ? date.clone().subtract(Math.abs(count), "hours")
    : date.clone().add(count, "hours");
};

export function addDays(date: Moment, count: number) {
  return count < 0
    ? date.clone().subtract(Math.abs(count), "days")
    : date.clone().add(count, "days");
};

export function addWeeks(date: Moment, count: number) {
  return count < 0
    ? date.clone().subtract(Math.abs(count), "weeks")
    : date.clone().add(count, "weeks");
};

export function addMonths(date: Moment, count: number) {
  return count < 0
    ? date.clone().subtract(Math.abs(count), "months")
    : date.clone().add(count, "months");
};

export function addYears(date: Moment, count: number) {
  return count < 0
    ? date.clone().subtract(Math.abs(count), "years")
    : date.clone().add(count, "years");
};

export function setHours(date: Moment, count: number) {
  return date.clone().hours(count);
};

export function getMinutes(date: Moment) {
  return date.get("minutes");
};

export function setMinutes(date: Moment, count: number) {
  return date.clone().minutes(count);
};

export function getSeconds(date: Moment) {
  return date.get("seconds");
};

export function setSeconds(date: Moment, count: number) {
  return date.clone().seconds(count);
};

export function getWeek(date: Moment) {
  return date.get("week");
};

export function getMonth(date: Moment) {
  return date.get("month");
};

export function getDaysInMonth(date: Moment) {
  return date.daysInMonth();
};

export function isSameDay(date: Moment, comparing: Moment) {
  return date.isSame(comparing, "day");
};

export function isSameMonth(date: Moment, comparing: Moment) {
  return date.isSame(comparing, "month");
};

export function isSameYear(date: Moment, comparing: Moment) {
  return date.isSame(comparing, "year");
};

export function isSameHour(date: Moment, comparing: Moment) {
  return date.isSame(comparing, "hour");
};

export function setMonth(date: Moment, count: number) {
  return date.clone().month(count);
};

export function getMeridiemText(meridiem: "am" | "pm") {
  if (is12HourCycleInCurrentLocale()) {
    // AM/PM translation only possible in those who have 12 hour cycle in locale.
    return moment
      .localeData(getCurrentLocaleCode())
      .meridiem(meridiem === "am" ? 0 : 13, 0, false);
  }

  return meridiem === "am" ? "AM" : "PM"; // fallback for de, ru, ...etc
};

export function startOfYear(date: Moment) {
  return date.clone().startOf("year");
};

export function endOfYear(date: Moment) {
  return date.clone().endOf("year");
};

export function startOfMonth(date: Moment) {
  return date.clone().startOf("month");
};

export function endOfMonth(date: Moment) {
  return date.clone().endOf("month");
};

export function startOfWeek(date: Moment) {
  return date.clone().startOf("week");
};

export function endOfWeek(date: Moment) {
  return date.clone().endOf("week");
};

export function getNextMonth(date: Moment) {
  return date.clone().add(1, "month");
};

export function getPreviousMonth(date: Moment) {
  return date.clone().subtract(1, "month");
};

export function getMonthArray(date: Moment) {
  const firstMonth = date.clone().startOf("year");
  const monthArray = [firstMonth];

  while (monthArray.length < 12) {
    const prevMonth = monthArray[monthArray.length - 1];
    monthArray.push(getNextMonth(prevMonth));
  }

  return monthArray;
};

export function getYear(date: Moment) {
  return date.get("year");
};

export function setYear(date: Moment, year: number) {
  return date.clone().set("year", year);
};

export function getDate(date: Moment) {
  return date.get("date");
};

export function setDate(date: Moment, day: number) {
  return date.clone().set("date", day);
};

export function mergeDateAndTime(date: Moment, time: Moment) {
  return date.hour(time.hour()).minute(time.minute()).second(time.second());
};

export function getWeekdays() {
  return moment.weekdaysShort(true);
};

export function isEqual(value: any, comparing: any) {
  if (value === null && comparing === null) {
    return true;
  }

  return moment(value).isSame(comparing);
};

export function getWeekArray(date: Moment) {
  const start = date.clone().startOf("month").startOf("week");
  const end = date.clone().endOf("month").endOf("week");

  let count = 0;
  let current = start;
  const nestedWeeks: Moment[][] = [];

  while (current.isBefore(end)) {
    const weekNumber = Math.floor(count / 7);
    nestedWeeks[weekNumber] = nestedWeeks[weekNumber] || [];
    nestedWeeks[weekNumber].push(current);

    current = current.clone().add(1, "day");
    count += 1;
  }

  return nestedWeeks;
};

export function getYearRange(start: Moment, end: Moment) {
  const startDate = moment(start).startOf("year");
  const endDate = moment(end).endOf("year");
  const years: Moment[] = [];

  let current = startDate;
  while (current.isBefore(endDate)) {
    years.push(current);
    current = current.clone().add(1, "year");
  }

  return years;
};

export function isWithinRange(date: Moment, [start, end]: [Moment, Moment]) {
  return date.isBetween(start, end, null, "[]");
};


`;
}
