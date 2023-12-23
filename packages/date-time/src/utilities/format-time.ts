import { Temporal } from "@js-temporal/polyfill";
import { StormDateTime } from "../storm-date-time";
import { StormTime } from "../storm-time";

/**
 * Format a time field
 *
 * @param dateTime - The date time to format
 * @returns The formatted time string
 */
export const formatTime = (
  dateTime: StormDateTime = StormTime.current(),
  options: Partial<Temporal.ZonedDateTimeToStringOptions> = {
    smallestUnit: "milliseconds",
    roundingMode: "ceil",
    calendarName: "never",
    timeZoneName: "never",
    offset: "never"
  }
): string => dateTime.zonedDateTime.toPlainTime().toString(options);
