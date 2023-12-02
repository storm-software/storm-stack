import { Temporal } from "@js-temporal/polyfill";
import { StormDate } from "../storm-date";
import { StormDateTime } from "../storm-date-time";

/**
 * Format a date field
 *
 * @param dateTime - The date time to format
 * @returns The formatted date
 */
export const formatDate = (
  dateTime: StormDateTime = StormDate.current(),
  options: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  > = { smallestUnit: "minute" }
): string => dateTime.zonedDateTime.toPlainDate().toString(options);
