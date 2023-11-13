import { Temporal } from "@js-temporal/polyfill";
import { EMPTY_STRING } from "@storm-software/utilities";
import { DateTime } from "../date-time";

/**
 * Format a date time field into ISO format
 *
 * @param dateTime - The date time to format
 * @param options - The options to use
 * @returns The formatted date time
 */
export const formatDateTimeISO = (
  dateTime?: DateTime | null,
  options: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  > = { smallestUnit: "milliseconds" }
): string =>
  dateTime
    ? `${dateTime.instant
        .toZonedDateTimeISO(dateTime.timeZoneId ?? process.env.TZ ?? "UTC")
        .toString(options)}`
    : EMPTY_STRING;
