import { Temporal } from "@js-temporal/polyfill";
import { EMPTY_STRING } from "@storm-stack/utilities";
import { StormDateTime } from "../storm-date-time";

/**
 * Format a date time field into ISO format
 *
 * @param dateTime - The date time to format
 * @param options - The options to use
 * @returns The formatted date time
 */
export const formatDateTimeISO = (
  dateTime?: StormDateTime | null,
  options: Partial<Temporal.ZonedDateTimeToStringOptions> = {
    smallestUnit: "milliseconds",
    roundingMode: "ceil",
    calendarName: "never",
    timeZoneName: "never",
    offset: "never"
  }
): string =>
  dateTime
    ? `${dateTime.instant
        .toZonedDateTimeISO(dateTime.timeZoneId ?? process.env.TZ ?? "UTC")
        .toString(options)}`
    : EMPTY_STRING;
