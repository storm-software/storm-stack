import { Temporal } from "@js-temporal/polyfill";
import { StormDateTime } from "../date-time";

/**
 * Format a date field
 *
 * @param dateTime - The date time to format
 * @returns The formatted date
 */
export const formatDate = (
  dateTime: StormDateTime = StormDateTime.current(),
  options: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  > = { smallestUnit: "milliseconds" }
): string => dateTime.zonedDateTime.toPlainDate().toString(options);
