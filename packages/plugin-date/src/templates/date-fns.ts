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
 * @param context - The build context containing runtime information.
 * @returns A string representing the configuration file content.
 */
export async function DateFnsModule(context: Context) {
  return `
/**
 * The Storm Stack date module provides utility functions for date manipulation and formatting
 *
 * @module storm:date
 */

${getFileHeader()}

import { DateFormats, TimeUnit } from "@storm-stack/types/shared/date";
import { addDays as dateFnsAddDays } from "date-fns/addDays";
import { addHours as dateFnsAddHours } from "date-fns/addHours";
import { addMinutes as dateFnsAddMinutes } from "date-fns/addMinutes";
import { addMonths as dateFnsAddMonths } from "date-fns/addMonths";
import { addSeconds as dateFnsAddSeconds } from "date-fns/addSeconds";
import { addWeeks as dateFnsAddWeeks } from "date-fns/addWeeks";
import { addYears as dateFnsAddYears } from "date-fns/addYears";
import { differenceInDays } from "date-fns/differenceInDays";
import { differenceInHours } from "date-fns/differenceInHours";
import { differenceInMilliseconds } from "date-fns/differenceInMilliseconds";
import { differenceInMinutes } from "date-fns/differenceInMinutes";
import { differenceInMonths } from "date-fns/differenceInMonths";
import { differenceInQuarters } from "date-fns/differenceInQuarters";
import { differenceInSeconds } from "date-fns/differenceInSeconds";
import { differenceInWeeks } from "date-fns/differenceInWeeks";
import { differenceInYears } from "date-fns/differenceInYears";
import { eachDayOfInterval } from "date-fns/eachDayOfInterval";
import { endOfDay as dateFnsEndOfDay } from "date-fns/endOfDay";
import { endOfMonth as dateFnsEndOfMonth } from "date-fns/endOfMonth";
import { endOfWeek as dateFnsEndOfWeek } from "date-fns/endOfWeek";
import { endOfYear as dateFnsEndOfYear } from "date-fns/endOfYear";
import { format as dateFnsFormat, longFormatters } from "date-fns/format";
import { formatISO } from "date-fns/formatISO";
import { getDate as dateFnsGetDate } from "date-fns/getDate";
import { getDay as dateFnsGetDay } from "date-fns/getDay";
import { getDaysInMonth as dateFnsGetDaysInMonth } from "date-fns/getDaysInMonth";
import { getHours as dateFnsGetHours } from "date-fns/getHours";
import { getMinutes as dateFnsGetMinutes } from "date-fns/getMinutes";
import { getMonth as dateFnsGetMonth } from "date-fns/getMonth";
import { getSeconds as dateFnsGetSeconds } from "date-fns/getSeconds";
import { getWeek as dateFnsGetWeek } from "date-fns/getWeek";
import { getYear as dateFnsGetYear } from "date-fns/getYear";
import { isAfter as dateFnsIsAfter } from "date-fns/isAfter";
import { isBefore as dateFnsIsBefore } from "date-fns/isBefore";
import { isEqual as dateFnsIsEqual } from "date-fns/isEqual";
import { isSameDay as dateFnsIsSameDay } from "date-fns/isSameDay";
import { isSameHour as dateFnsIsSameHour } from "date-fns/isSameHour";
import { isSameMonth as dateFnsIsSameMonth } from "date-fns/isSameMonth";
import { isSameYear as dateFnsIsSameYear } from "date-fns/isSameYear";
import { isValid as dateFnsIsValid } from "date-fns/isValid";
import { isWithinInterval } from "date-fns/isWithinInterval";
import { Locale } from "date-fns/locale";
import { ${
    context.options.locale?.replaceAll("-", "") || "enUS"
  } as defaultLocale } from "date-fns/locale/${
    context.options.locale || "en-US"
  }";
import { parse as dateFnsParse } from "date-fns/parse";
import { parseISO as dateFnsParseISO } from "date-fns/parseISO";
import { setDate as dateFnsSetDate } from "date-fns/setDate";
import { setHours as dateFnsSetHours } from "date-fns/setHours";
import { setMinutes as dateFnsSetMinutes } from "date-fns/setMinutes";
import { setMonth as dateFnsSetMonth } from "date-fns/setMonth";
import { setSeconds as dateFnsSetSeconds } from "date-fns/setSeconds";
import { setYear as dateFnsSetYear } from "date-fns/setYear";
import { startOfDay as dateFnsStartOfDay } from "date-fns/startOfDay";
import { startOfMonth as dateFnsStartOfMonth } from "date-fns/startOfMonth";
import { startOfWeek as dateFnsStartOfWeek } from "date-fns/startOfWeek";
import { startOfYear as dateFnsStartOfYear } from "date-fns/startOfYear";

export const formats: DateFormats = {
  dayOfMonth: "d",
  fullDate: "PP",
  fullDateWithWeekday: "PPPP",
  fullDateTime: "PP p",
  fullDateTime12h: "PP hh:mm aa",
  fullDateTime24h: "PP HH:mm",
  fullTime: "p",
  fullTime12h: "hh:mm aa",
  fullTime24h: "HH:mm",
  hours12h: "hh",
  hours24h: "HH",
  keyboardDate: "P",
  keyboardDateTime: "P p",
  keyboardDateTime12h: "P hh:mm aa",
  keyboardDateTime24h: "P HH:mm",
  minutes: "mm",
  month: "LLLL",
  monthAndDate: "MMMM d",
  monthAndYear: "LLLL yyyy",
  monthShort: "MMM",
  weekday: "EEEE",
  weekdayShort: "EEE",
  normalDate: "d MMMM",
  normalDateWithWeekday: "EEE, MMM d",
  seconds: "ss",
  shortDate: "MMM d",
  year: "yyyy"
};

export const locale: Locale = defaultLocale;

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
  TArg = undefined,
  TResultingDate = TArg extends null
    ? null
    : TArg extends undefined
      ? Date
      : Date | null
>(value?: TArg): TResultingDate {
  if (typeof value === "undefined") {
    return new Date() as TResultingDate;
  }
  if (value === null) {
    return null as TResultingDate;
  }
  return new Date(value as string | number) as TResultingDate;
}

export const type = "date-fns";

// Note: date-fns input types are more lenient than this adapter, so we need to expose our more
// strict signature and delegate to the more lenient signature. Otherwise, we have downstream type errors upon usage.
export function is12HourCycleInCurrentLocale(): boolean {
  if (locale) {
    return /a/.test(locale.formatLong?.time({}));
  }

  // By default date-fns is using en-US locale with am/pm enabled
  return true;
}

export function getFormatHelperText(format: string) {
  // @see https://github.com/date-fns/date-fns/blob/master/src/format/index.js#L31
  const longFormatRegexp = /P+p+|P+|p+|''|'(?:''|[^'])+(?:'|$)|./g;
  const _locale = locale || defaultLocale;

  return (
    format
      .match(longFormatRegexp)
      ?.map(token => {
        const firstCharacter = token[0];
        if (firstCharacter === "p" || firstCharacter === "P") {
          const longFormatter = longFormatters[firstCharacter]!;

          return longFormatter(token, _locale.formatLong);
        }

        return token;
      })
      .join("")
      .replace(/aaa|aa|a/g, "(a|p)m")
      .toLocaleLowerCase() ?? format
  );
}

export function parseISO(isoString: string) {
  return dateFnsParseISO(isoString);
}

export function toISO(value: Date) {
  return formatISO(value, {
    format: "extended"
  });
}

export function getCurrentLocaleCode() {
  return locale?.code || "en-US";
}

export function addSeconds(value: Date, count: number) {
  return dateFnsAddSeconds(value, count);
}

export function addMinutes(value: Date, count: number) {
  return dateFnsAddMinutes(value, count);
}

export function addHours(value: Date, count: number) {
  return dateFnsAddHours(value, count);
}

export function addDays(value: Date, count: number) {
  return dateFnsAddDays(value, count);
}

export function addWeeks(value: Date, count: number) {
  return dateFnsAddWeeks(value, count);
}

export function addMonths(value: Date, count: number) {
  return dateFnsAddMonths(value, count);
}

export function addYears(value: Date, count: number) {
  return dateFnsAddYears(value, count);
}

export function isValid(value: any) {
  return dateFnsIsValid(createDate(value));
}

export function getDiff(
  value: Date,
  comparing: Date | string,
  unit?: TimeUnit
) {
  // we output 0 if the compare date is string and parsing is not valid
  const dateToCompare = createDate(comparing) ?? value;
  if (!isValid(dateToCompare)) {
    return 0;
  }

  switch (unit) {
    case "years":
      return differenceInYears(value, dateToCompare);
    case "quarters":
      return differenceInQuarters(value, dateToCompare);
    case "months":
      return differenceInMonths(value, dateToCompare);
    case "weeks":
      return differenceInWeeks(value, dateToCompare);
    case "days":
      return differenceInDays(value, dateToCompare);
    case "hours":
      return differenceInHours(value, dateToCompare);
    case "minutes":
      return differenceInMinutes(value, dateToCompare);
    case "seconds":
      return differenceInSeconds(value, dateToCompare);
    case "milliseconds":
    case undefined:
    default:
      return differenceInMilliseconds(value, dateToCompare);
  }
}

export function isAfter(value: Date, comparing: Date) {
  return dateFnsIsAfter(value, comparing);
}

export function isBefore(value: Date, comparing: Date) {
  return dateFnsIsBefore(value, comparing);
}

export function startOfDay(value: Date) {
  return dateFnsStartOfDay(value);
}

export function endOfDay(value: Date) {
  return dateFnsEndOfDay(value);
}

export function getHours(value: Date) {
  return dateFnsGetHours(value);
}

export function setHours(value: Date, count: number) {
  return dateFnsSetHours(value, count);
}

export function setMinutes(value: Date, count: number) {
  return dateFnsSetMinutes(value, count);
}

export function getSeconds(value: Date) {
  return dateFnsGetSeconds(value);
}

export function setSeconds(value: Date, count: number) {
  return dateFnsSetSeconds(value, count);
}

export function isSameDay(value: Date, comparing: Date) {
  return dateFnsIsSameDay(value, comparing);
}

export function isSameMonth(value: Date, comparing: Date) {
  return dateFnsIsSameMonth(value, comparing);
}

export function isSameYear(value: Date, comparing: Date) {
  return dateFnsIsSameYear(value, comparing);
}

export function isSameHour(value: Date, comparing: Date) {
  return dateFnsIsSameHour(value, comparing);
}

export function startOfYear(value: Date) {
  return dateFnsStartOfYear(value);
}

export function endOfYear(value: Date) {
  return dateFnsEndOfYear(value);
}

export function startOfMonth(value: Date) {
  return dateFnsStartOfMonth(value);
}

export function endOfMonth(value: Date) {
  return dateFnsEndOfMonth(value);
}

export function startOfWeek(value: Date) {
  return dateFnsStartOfWeek(value, {
    locale
  });
}

export function endOfWeek(value: Date) {
  return dateFnsEndOfWeek(value, {
    locale
  });
}

export function getYear(value: Date) {
  return dateFnsGetYear(value);
}

export function setYear(value: Date, count: number) {
  return dateFnsSetYear(value, count);
}

export function toJsDate(value: Date) {
  return value;
}

export function parse(value: string, formatString: string) {
  if (value === "") {
    return null;
  }
  return dateFnsParse(value, formatString, new Date(), {
    locale
  });
}

export function format(date: Date, formatKey: keyof DateFormats) {
  return formatByString(date, formats[formatKey]);
}

export function formatByString(date: Date, formatString: string) {
  return dateFnsFormat(date, formatString, {
    locale
  });
}

export function isEqual(date: any, comparing: any) {
  if (date === null && comparing === null) {
    return true;
  }
  return dateFnsIsEqual(date, comparing);
}

export function isNull(date: Date) {
  return date === null;
}

export function isAfterDay(date: Date, value: Date) {
  return isAfter(date, endOfDay(value));
}

export function isBeforeDay(date: Date, value: Date) {
  return isBefore(date, startOfDay(value));
}

export function isBeforeYear(date: Date, value: Date) {
  return isBefore(date, startOfYear(value));
}

export function isBeforeMonth(value: Date, comparing: Date): boolean {
  return isBefore(value, startOfMonth(comparing));
}

export function isAfterMonth(value: Date, comparing: Date): boolean {
  return isAfter(value, startOfMonth(comparing));
}

export function isAfterYear(date: Date, value: Date) {
  return isAfter(date, endOfYear(value));
}

export function isWithinRange(date: Date, [start, end]: [Date, Date]) {
  return isWithinInterval(date, {
    start,
    end
  });
}

export function formatNumber(numberToFormat: string) {
  return numberToFormat;
}

export function getMinutes(date: Date) {
  return dateFnsGetMinutes(date);
}

export function getDate(date: Date) {
  return dateFnsGetDate(date);
}

export function setDate(date: Date, count: number) {
  return dateFnsSetDate(date, count);
}

export function getWeek(date: Date) {
  return dateFnsGetWeek(date);
}

export function getMonth(date: Date) {
  return dateFnsGetMonth(date);
}

export function getDaysInMonth(date: Date) {
  return dateFnsGetDaysInMonth(date);
}

export function setMonth(date: Date, count: number) {
  return dateFnsSetMonth(date, count);
}

export function getMeridiemText(meridiem: "am" | "pm") {
  return meridiem === "am" ? "AM" : "PM";
}

export function getNextMonth(date: Date) {
  return addMonths(date, 1);
}

export function getPreviousMonth(date: Date) {
  return addMonths(date, -1);
}

export function getMonthArray(date: Date) {
  const firstMonth = startOfYear(date);
  const monthArray = [firstMonth];

  while (monthArray.length < 12) {
    const prevMonth = monthArray[monthArray.length - 1]!;
    monthArray.push(getNextMonth(prevMonth));
  }

  return monthArray;
}

export function mergeDateAndTime(date: Date, time: Date) {
  return setSeconds(
    setMinutes(setHours(date, getHours(time)), getMinutes(time)),
    getSeconds(time)
  );
}

export function getWeekdays() {
  const now = new Date();

  return eachDayOfInterval({
    start: startOfWeek(now),
    end: endOfWeek(now)
  }).map(day => formatByString(day, "EEEEEE"));
}

export function getWeekArray(date: Date) {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  let count = 0;
  let current = start;
  const nestedWeeks: Date[][] = [];
  let lastDay = null as null | number;
  while (isBefore(current, end)) {
    const weekNumber = Math.floor(count / 7);
    nestedWeeks[weekNumber] ??= [];
    const day = dateFnsGetDay(current);
    if (lastDay !== day) {
      lastDay = day;
      nestedWeeks[weekNumber].push(current);
      count += 1;
    }
    current = addDays(current, 1);
  }
  return nestedWeeks;
}

export function getYearRange(start: Date, end: Date) {
  const startDate = startOfYear(start);
  const endDate = endOfYear(end);
  const years: Date[] = [];

  let current = startDate;
  while (isBefore(current, endDate)) {
    years.push(current);
    current = addYears(current, 1);
  }
  return years;
}


`;
}
