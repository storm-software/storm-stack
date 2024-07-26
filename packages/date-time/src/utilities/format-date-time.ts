import type { Temporal } from "@js-temporal/polyfill";
import { EMPTY_STRING } from "@storm-stack/utilities";
import { StormDateTime } from "../storm-date-time";

/**
 * Format a date time field
 *
 * @param dateTime - The date time to format
 * @param options - The options to use
 * @returns The formatted date time
 */
export const formatDateTime = (
  dateTime: StormDateTime = StormDateTime.current(),
  options: Partial<Temporal.ZonedDateTimeToStringOptions> = {
    smallestUnit: "millisecond",
    roundingMode: "ceil",
    calendarName: "never",
    timeZoneName: "never",
    offset: "never"
  }
): string =>
  dateTime
    ? `${dateTime.zonedDateTime.toString(options).replaceAll("T", " ")}`
    : EMPTY_STRING;
