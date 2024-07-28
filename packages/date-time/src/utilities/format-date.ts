import type { Temporal } from "@js-temporal/polyfill";
import { StormDate } from "../storm-date";
import type { StormDateTime } from "../storm-date-time";

/**
 * Format a date field
 *
 * @param dateTime - The date time to format
 * @returns The formatted date
 */
export const formatDate = (
  dateTime: StormDateTime = StormDate.current(),
  options?: Partial<Temporal.ShowCalendarOption>
): string => {
  const calendarName = options?.calendarName || "never";

  return dateTime.zonedDateTime.toPlainDate().toString({
    calendarName
  });
};
