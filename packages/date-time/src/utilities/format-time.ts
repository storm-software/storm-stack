import { Temporal } from "@js-temporal/polyfill";
import { StormDateTime } from "../date-time";
import { StormTime } from "../time";

/**
 * Format a time field
 *
 * @param dateTime - The date time to format
 * @returns The formatted time string
 */
export const formatTime = (
  dateTime: StormDateTime = StormTime.current(),
  options: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  > = { smallestUnit: "milliseconds" }
): string => dateTime.zonedDateTime.toPlainTime().toString(options);
