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
export async function DayjsModule(_context: Context) {
  return `
/**
 * The Storm Stack date module provides utility functions for date manipulation and formatting
 *
 * @module storm:date
 */

${getFileHeader()}

import defaultDayjs, { QUnitType } from "dayjs";
import customParseFormatPlugin from "dayjs/plugin/customParseFormat";
import localizedFormatPlugin from "dayjs/plugin/localizedFormat";
import isBetweenPlugin from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
  StormDateInterface,
  DateFormats,
  TimeUnit
} from "@storm-stack/types/shared/date";

defaultDayjs.extend(customParseFormatPlugin);
defaultDayjs.extend(localizedFormatPlugin);
defaultDayjs.extend(isBetweenPlugin);
defaultDayjs.extend(weekOfYear);

interface Opts {
  locale?: string;
  /** Make sure that your dayjs instance extends customParseFormat and advancedFormat */
  instance?: typeof defaultDayjs;
  formats?: Partial<DateFormats>;
}

type Dayjs = defaultDayjs.Dayjs;
type Constructor<TDate extends Dayjs> = (
  ...args: Parameters<typeof defaultDayjs>
) => TDate;
const withLocale = <TDate extends Dayjs>(
  dayjs: any,
  locale?: string
): Constructor<TDate> => (!locale ? dayjs : (...args) => dayjs(...args).locale(locale));

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

export let locale = $storm.dotenv.DEFAULT_LOCALE;

export const dayjs = withLocale(defaultDayjs, locale);

export const type = "dayjs";

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
    ? TDate
    : TDate | null
>(value?: TArg): TResultingDate {
  if (value === null) {
    return null as TResultingDate;
  }

  return dayjs(value as any) as unknown as TResultingDate;
}

export function is12HourCycleInCurrentLocale() {
  /* istanbul ignore next */
  return /A|a/.test(dayjs.Ls[dayjs.locale() || $storm.dotenv.DEFAULT_LOCALE]?.formats?.LT ?? "");
};

export function getCurrentLocaleCode() {
  return dayjs.locale() || $storm.dotenv.DEFAULT_LOCALE;
};

export function getFormatHelperText(format: string) {
  // @see https://github.com/iamkun/dayjs/blob/dev/src/plugin/localizedFormat/index.js
  const localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?)|./g;

  return (
    format
      .match(localFormattingTokens)
      ?.map((token) => {
        const firstCharacter = token[0];
        if (firstCharacter === "L") {
          /* istanbul ignore next */
          return (
            dayjs.Ls[dayjs.locale() || $storm.dotenv.DEFAULT_LOCALE]?.formats[
              token as keyof ILocale["formats"]
            ] ?? token
          );
        }
        return token;
      })
      .join("")
      .replace(/a/gi, "(a|p)m")
      .toLocaleLowerCase() ?? format
  );
};

export function parseISO(isoString: string) {
  return dayjs(isoString);
};

export function toISO(value: Dayjs) {
  return value.toISOString();
};

export function parse(value: any, format: string) {
  if (value === "") {
    return null;
  }

  return dayjs(value, format, dayjs.locale(), true);
};

export function toJsDate(value: Dayjs) {
  return value.toDate();
};

export function isValid(value: any) {
  return dayjs(value).isValid();
};

export function isNull(date: Dayjs | null) {
  return date === null;
};

export function getDiff(date: Dayjs, comparing: Dayjs | string, units?: Unit) {
  if (typeof comparing === "string") {
    comparing = dayjs(comparing);
  }

  if (!comparing.isValid()) {
    return 0;
  }

  return date.diff(comparing, units as QUnitType);
};

export function isAfter(date: Dayjs, value: Dayjs) {
  return date.isAfter(value);
};

export function isBefore(date: Dayjs, value: Dayjs) {
  return date.isBefore(value);
};

export function isAfterDay(date: Dayjs, value: Dayjs) {
  return date.isAfter(value, "day");
};

export function isBeforeDay(date: Dayjs, value: Dayjs) {
  return date.isBefore(value, "day");
};

export function isAfterMonth(date: Dayjs, value: Dayjs) {
  return date.isAfter(value, "month");
};

export function isBeforeMonth(date: Dayjs, value: Dayjs) {
  return date.isBefore(value, "month");
};

export function isBeforeYear(date: Dayjs, value: Dayjs) {
  return date.isBefore(value, "year");
};

export function isAfterYear(date: Dayjs, value: Dayjs) {
  return date.isAfter(value, "year");
};

export function startOfDay(date: Dayjs) {
  return date.startOf("day");
};

export function endOfDay(date: Dayjs) {
  return date.endOf("day");
};

export function format(date: Dayjs, formatKey: keyof DateFormats) {
  return formatByString(date, formats[formatKey]);
};

export function formatByString(date: Dayjs, formatString: string) {
  return dayjs(date).format(formatString);
};

export function formatNumber(numberToFormat: string) {
  return numberToFormat;
};

export function getHours(date: Dayjs) {
  return date.hour();
};

export function addSeconds(date: Dayjs, count: number) {
  return count < 0
    ? (date.subtract(Math.abs(count), "second") as Dayjs)
    : (date.add(count, "second") as Dayjs);
};

export function addMinutes(date: Dayjs, count: number) {
  return count < 0
    ? (date.subtract(Math.abs(count), "minute") as Dayjs)
    : (date.add(count, "minute") as Dayjs);
};

export function addHours(date: Dayjs, count: number) {
  return count < 0
    ? (date.subtract(Math.abs(count), "hour") as Dayjs)
    : (date.add(count, "hour") as Dayjs);
};

export function addDays(date: Dayjs, count: number) {
  return count < 0
    ? (date.subtract(Math.abs(count), "day") as Dayjs)
    : (date.add(count, "day") as Dayjs);
};

export function addWeeks(date: Dayjs, count: number) {
  return count < 0
    ? (date.subtract(Math.abs(count), "week") as Dayjs)
    : (date.add(count, "week") as Dayjs);
};

export function addMonths(date: Dayjs, count: number) {
  return count < 0
    ? (date.subtract(Math.abs(count), "month") as Dayjs)
    : (date.add(count, "month") as Dayjs);
};

export function addYears(date: Dayjs, count: number) {
  return count < 0
    ? (date.subtract(Math.abs(count), "year") as Dayjs)
    : (date.add(count, "year") as Dayjs);
};

export function setMonth(date: Dayjs, count: number) {
  return date.set("month", count) as Dayjs;
};

export function setHours(date: Dayjs, count: number) {
  return date.set("hour", count) as Dayjs;
};

export function getMinutes(date: Dayjs) {
  return date.minute();
};

export function setMinutes(date: Dayjs, count: number) {
  return date.set("minute", count) as Dayjs;
};

export function getSeconds(date: Dayjs) {
  return date.second();
};

export function setSeconds(date: Dayjs, count: number) {
  return date.set("second", count) as Dayjs;
};

export function getWeek(date: Dayjs) {
  return date.week();
};

export function getMonth(date: Dayjs) {
  return date.month();
};

export function getDate(date: Dayjs) {
  return date.date();
};

export function setDate(date: Dayjs, count: number) {
  return date.set("date", count) as Dayjs;
};

export function getDaysInMonth(date: Dayjs) {
  return date.daysInMonth();
};

export function isSameDay(date: Dayjs, comparing: Dayjs) {
  return date.isSame(comparing, "day");
};

export function isSameMonth(date: Dayjs, comparing: Dayjs) {
  return date.isSame(comparing, "month");
};

export function isSameYear(date: Dayjs, comparing: Dayjs) {
  return date.isSame(comparing, "year");
};

export function isSameHour(date: Dayjs, comparing: Dayjs) {
  return date.isSame(comparing, "hour");
};

export function getMeridiemText(meridiem: "am" | "pm") {
  return meridiem === "am" ? "AM" : "PM";
};

export function startOfYear(date: Dayjs) {
  return date.startOf("year") as Dayjs;
};

export function endOfYear(date: Dayjs) {
  return date.endOf("year") as Dayjs;
};

export function startOfMonth(date: Dayjs) {
  return date.startOf("month") as Dayjs;
};

export function endOfMonth(date: Dayjs) {
  return date.endOf("month") as Dayjs;
};

export function startOfWeek(date: Dayjs) {
  return date.startOf("week") as Dayjs;
};

export function endOfWeek(date: Dayjs) {
  return date.endOf("week") as Dayjs;
};

export function getNextMonth(date: Dayjs) {
  return date.add(1, "month") as Dayjs;
};

export function getPreviousMonth(date: Dayjs) {
  return date.subtract(1, "month") as Dayjs;
};

export function getMonthArray(date: Dayjs) {
  const firstMonth = date.startOf("year") as Dayjs;
  const monthArray = [firstMonth];

  while (monthArray.length < 12) {
    const prevMonth = monthArray[monthArray.length - 1];
    monthArray.push(getNextMonth(prevMonth));
  }

  return monthArray;
};

export function getYear(date: Dayjs) {
  return date.year();
};

export function setYear(date: Dayjs, year: number) {
  return date.set("year", year) as Dayjs;
};

export function mergeDateAndTime(date: Dayjs, time: Dayjs) {
  return date.hour(time.hour()).minute(time.minute()).second(time.second()) as Dayjs;
};

export function getWeekdays() {
  const start = dayjs().startOf("week");
  return [0, 1, 2, 3, 4, 5, 6].map((diff) =>
    formatByString(start.add(diff, "day"), "dd")
  );
};

export function isEqual(value: any, comparing: any) {
  if (value === null && comparing === null) {
    return true;
  }

  return dayjs(value).isSame(comparing);
};

export function getWeekArray(date: Dayjs) {
  const start = dayjs(date).startOf("month").startOf("week") as Dayjs;
  const end = dayjs(date).endOf("month").endOf("week") as Dayjs;

  let count = 0;
  let current = start;
  const nestedWeeks: Dayjs[][] = [];

  while (current.isBefore(end)) {
    const weekNumber = Math.floor(count / 7);
    nestedWeeks[weekNumber] = nestedWeeks[weekNumber] || [];
    nestedWeeks[weekNumber].push(current);

    current = current.add(1, "day") as TDate;
    count += 1;
  }

  return nestedWeeks;
};

export function getYearRange(start: Dayjs, end: Dayjs) {
  const startDate = start.startOf("year");
  const endDate = end.endOf("year");
  const years: Dayjs[] = [];

  let current = startDate;
  while (current.isBefore(endDate)) {
    years.push(current);
    current = current.add(1, "year");
  }

  return years;
};

export function isWithinRange(date: Dayjs, [start, end]: [Dayjs, Dayjs]) {
  return date.isBetween(start, end, null, "[]");
};


`;
}
