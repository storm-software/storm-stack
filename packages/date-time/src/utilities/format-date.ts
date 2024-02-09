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
  options: Partial<Temporal.ZonedDateTimeToStringOptions> = {
    smallestUnit: "minute",
    roundingMode: "ceil",
    calendarName: "never",
    timeZoneName: "never",
    offset: "never"
  }
): string => dateTime.zonedDateTime.toPlainDate().toString(options);
