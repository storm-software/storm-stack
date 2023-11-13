import { Temporal } from "@js-temporal/polyfill";
import { DateTime } from "../date-time";

/**
 * Format a date field
 *
 * @param dateTime - The date time to format
 * @returns The formatted date
 */
export const formatDate = (
  dateTime: DateTime = DateTime.current(),
  options: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  > = { smallestUnit: "milliseconds" }
): string => dateTime.zonedDateTime.toPlainDate().toString(options);
