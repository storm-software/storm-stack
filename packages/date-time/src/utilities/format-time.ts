import { Temporal } from "@js-temporal/polyfill";
import { DateTime } from "../date-time";

/**
 * Format a time field
 *
 * @param dateTime - The date time to format
 * @returns The formatted time string
 */
export const formatTime = (
  dateTime: DateTime = DateTime.current(),
  options: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  > = { smallestUnit: "milliseconds" }
): string => dateTime.zonedDateTime.toPlainTime().toString(options);
