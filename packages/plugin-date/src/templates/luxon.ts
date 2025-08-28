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
export async function LuxonModule(_context: Context) {
  return `
/**
 * The Storm Stack date module provides utility functions for date manipulation and formatting
 *
 * @module storm:date
 */

${getFileHeader()}

import { DateTime, Settings, Info } from "luxon";
import {
  StormDateInterface,
  DateFormats,
  TimeUnit
} from "@storm-stack/types/shared/date";

export const formats: DateFormats = {
  dayOfMonth: "d",
  fullDate: "DD",
  fullDateWithWeekday: "DDDD",
  fullDateTime: "ff",
  fullDateTime12h: "DD, hh:mm a",
  fullDateTime24h: "DD, T",
  fullTime: "t",
  fullTime12h: "hh:mm a",
  fullTime24h: "HH:mm",
  hours12h: "hh",
  hours24h: "HH",
  keyboardDate: "D",
  keyboardDateTime: "D t",
  keyboardDateTime12h: "D hh:mm a",
  keyboardDateTime24h: "D T",
  systemDateTime: "D HH:mm:ss.SSS",
  filePathDateTime: "D_HH-mm-ss-SSS",
  minutes: "mm",
  seconds: "ss",
  month: "LLLL",
  monthAndDate: "MMMM d",
  monthAndYear: "LLLL yyyy",
  monthShort: "MMM",
  weekday: "cccc",
  weekdayShort: "ccc",
  normalDate: "d MMMM",
  normalDateWithWeekday: "EEE, MMM d",
  shortDate: "MMM d",
  year: "yyyy",
};

export let locale = $storm.config.static.DEFAULT_LOCALE;

export const type = "luxon";

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
    ? DateTime
    : DateTime | null
>(value?: TArg): TResultingDate {
  if (typeof value === "undefined") {
    return DateTime.local() as TResultingDate;
  }

  if (value === null) {
    return null as TResultingDate;
  }

  if (typeof value === "string") {
    return DateTime.fromJSDate(new Date(value), { locale }) as TResultingDate;
  }

  if (DateTime.isDateTime(value)) {
    return value as TResultingDate;
  }

  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { locale }) as TResultingDate;
  }

  /* istanbul ignore next */
  return DateTime.local() as TResultingDate;
}

export function toJsDate(value: DateTime) {
  return value.toJSDate();
};

export function parseISO(isoString: string) {
  return DateTime.fromISO(isoString);
};

export function toISO(value: DateTime) {
  return value.toISO({ format: "extended" });
};

export function parse(value: string, formatString: string) {
  if (value === "") {
    return null;
  }

  return DateTime.fromFormat(value, formatString, { locale });
};

/* istanbul ignore next */
export function is12HourCycleInCurrentLocale() {
  if (typeof Intl === "undefined" || typeof Intl.DateTimeFormat === "undefined") {
    return true; // Luxon defaults to en-US if Intl not found
  }

  return Boolean(
    new Intl.DateTimeFormat(this.locale, { hour: "numeric" })?.resolvedOptions()?.hour12
  );
};

export function getFormatHelperText(format: string) {
  // Unfortunately there is no way for luxon to retrieve readable formats from localized format
  return "";
};

/* istanbul ignore next */
export function getCurrentLocaleCode() {
  return this.locale || Settings.defaultLocale;
};

export function addSeconds(date: DateTime, count: number) {
  return date.plus({ seconds: count });
};

export function addMinutes(date: DateTime, count: number) {
  return date.plus({ minutes: count });
};

export function addHours(date: DateTime, count: number) {
  return date.plus({ hours: count });
};

export function addDays(date: DateTime, count: number) {
  return date.plus({ days: count });
};

export function addWeeks(date: DateTime, count: number) {
  return date.plus({ weeks: count });
};

export function addMonths(date: DateTime, count: number) {
  return date.plus({ months: count });
};

export function addYears(date: DateTime, count: number) {
  return date.plus({ years: count });
};

export function isValid(value: any) {
  if (DateTime.isDateTime(value)) {
    return value.isValid;
  }

  if (value === null) {
    return false;
  }

  return createDate(value)?.isValid ?? false;
};

export function isEqual(value: any, comparing: any) {
  if (value === null && comparing === null) {
    return true;
  }

  // make sure that null will not be passed to createDate
  if (value === null || comparing === null) {
    return false;
  }

  if (!createDate(comparing)) {
    /* istanbul ignore next */
    return false;
  }

  return createDate(value)?.equals(createDate(comparing) as DateTime) ?? false;
};

export function isSameDay(date: DateTime, comparing: DateTime) {
  return date.hasSame(comparing, "day");
};

export function isSameMonth(date: DateTime, comparing: DateTime) {
  return date.hasSame(comparing, "month");
};

export function isSameYear(date: DateTime, comparing: DateTime) {
  return date.hasSame(comparing, "year");
};

export function isSameHour(date: DateTime, comparing: DateTime) {
  return date.hasSame(comparing, "hour");
};

export function isAfter(value: DateTime, comparing: DateTime) {
  return value > comparing;
};

export function isBefore(value: DateTime, comparing: DateTime) {
  return value < comparing;
};

export function isBeforeDay(value: DateTime, comparing: DateTime) {
  const diff = value.diff(comparing.startOf("day"), "days").toObject();
  return diff.days! < 0;
};

export function isAfterDay(value: DateTime, comparing: DateTime) {
  const diff = value.diff(comparing.endOf("day"), "days").toObject();
  return diff.days! > 0;
};

export function isBeforeMonth(value: DateTime, comparing: DateTime) {
  const diff = value.diff(comparing.startOf("month"), "months").toObject();
  return diff.months! < 0;
};

export function isAfterMonth(value: DateTime, comparing: DateTime) {
  const diff = value.diff(comparing.startOf("month"), "months").toObject();
  return diff.months! > 0;
};

export function isBeforeYear(value: DateTime, comparing: DateTime) {
  const diff = value.diff(comparing.startOf("year"), "years").toObject();
  return diff.years! < 0;
};

export function isAfterYear(value: DateTime, comparing: DateTime) {
  const diff = value.diff(comparing.endOf("year"), "years").toObject();
  return diff.years! > 0;
};

export function getDiff(value: DateTime, comparing: DateTime | string, unit?: TimeUnit) {
  if (typeof comparing === "string") {
    comparing = DateTime.fromJSDate(new Date(comparing));
  }

  if (!comparing.isValid) {
    return 0;
  }

  if (unit) {
    return Math.floor(value.diff(comparing).as(unit));
  }

  return value.diff(comparing).as("millisecond");
};

export function startOfDay(value: DateTime) {
  return value.startOf("day");
};

export function endOfDay(value: DateTime) {
  return value.endOf("day");
};

export function format(date: DateTime, formatKey: keyof DateFormats) {
  return formatByString(date, formats[formatKey]);
};

export function formatByString(date: DateTime, format: string) {
  return date.setLocale(locale).toFormat(format);
};

export function formatNumber(numberToFormat: string) {
  return numberToFormat;
};

export function getHours(value: DateTime) {
  return value.get("hour");
};

export function setHours(value: DateTime, count: number) {
  return value.set({ hour: count });
};

export function getMinutes(value: DateTime) {
  return value.get("minute");
};

export function setMinutes(value: DateTime, count: number) {
  return value.set({ minute: count });
};

export function getSeconds(value: DateTime) {
  return value.get("second");
};

export function setSeconds(value: DateTime, count: number) {
  return value.set({ second: count });
};

export function getWeek(value: DateTime) {
  return value.get("weekNumber");
};

export function getMonth(value: DateTime) {
  // See https://github.com/moment/luxon/blob/master/docs/moment.md#major-functional-differences
  return value.get("month") - 1;
};

export function getDaysInMonth(value: DateTime) {
  return value.daysInMonth;
};

export function setMonth(value: DateTime, count: number) {
  return value.set({ month: count + 1 });
};

export function getYear(value: DateTime) {
  return value.get("year");
};

export function setYear(value: DateTime, year: number) {
  return value.set({ year });
};

export function getDate(value: DateTime) {
  return value.get("day");
};

export function setDate(value: DateTime, day: number) {
  return value.set({ day });
};

export function mergeDateAndTime(date: DateTime, time: DateTime) {
  return date.set({
    second: time.second,
    hour: time.hour,
    minute: time.minute,
  });
};

export function startOfYear(value: DateTime) {
  return value.startOf("year");
};

export function endOfYear(value: DateTime) {
  return value.endOf("year");
};

export function startOfMonth(value: DateTime) {
  return value.startOf("month");
};

export function endOfMonth(value: DateTime) {
  return value.endOf("month");
};

export function startOfWeek(value: DateTime) {
  return value.startOf("week");
};

export function endOfWeek(value: DateTime) {
  return value.endOf("week");
};

export function getNextMonth(value: DateTime) {
  return value.plus({ months: 1 });
};

export function getPreviousMonth(value: DateTime) {
  return value.minus({ months: 1 });
};

export function getMonthArray(date: DateTime) {
  const firstMonth = date.startOf("year");
  const monthArray = [firstMonth];

  while (monthArray.length < 12) {
    const prevMonth = monthArray[monthArray.length - 1];
    monthArray.push(this.getNextMonth(prevMonth));
  }

  return monthArray;
};

export function getWeekdays() {
  return Info.weekdaysFormat("short", { locale });
};

export function getWeekArray(date: DateTime) {
  const { days } = date
    .endOf("month")
    .endOf("week")
    .diff(date.startOf("month").startOf("week"), "days")
    .toObject();

  const weeks: DateTime[][] = [];
  new Array<number>(Math.round(days!))
    .fill(0)
    .map((_, i) => i)
    .map((day) => date.startOf("month").startOf("week").plus({ days: day }))
    .forEach((v, i) => {
      if (i === 0 || (i % 7 === 0 && i > 6)) {
        weeks.push([v]);
        return;
      }

      weeks[weeks.length - 1].push(v);
    });

  return weeks;
};

export function getYearRange(start: DateTime, end: DateTime) {
  const startDate = start.startOf("year");
  const endDate = end.endOf("year");

  let current = startDate;
  const years: DateTime[] = [];

  while (current < endDate) {
    years.push(current);
    current = current.plus({ year: 1 });
  }

  return years;
};

export function getMeridiemText(meridiem: "am" | "pm") {
  return Info.meridiems({ locale }).find(
    (v) => v.toLowerCase() === meridiem.toLowerCase()
  )!;
};

export function isNull(date: DateTime | null) {
  return date === null;
};

export function isWithinRange(date: DateTime, [start, end]: [DateTime, DateTime]) {
  return (
    date.equals(start) ||
    date.equals(end) ||
    (isAfter(date, start) && isBefore(date, end))
  );
};


`;
}
