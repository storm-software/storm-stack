import { Temporal } from "@js-temporal/polyfill";
import { EMPTY_STRING } from "@storm-software/utilities";
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
  options: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  > = { smallestUnit: "milliseconds" }
): string =>
  dateTime ? `${dateTime.zonedDateTime.toString(options)}` : EMPTY_STRING;
