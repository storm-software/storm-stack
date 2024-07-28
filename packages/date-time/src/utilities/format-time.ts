import type { Temporal } from "@js-temporal/polyfill";
import type { StormDateTime } from "../storm-date-time";
import { StormTime } from "../storm-time";

/**
 * Format a time field
 *
 * @param dateTime - The date time to format
 * @returns The formatted time string
 */
export const formatTime = (
  dateTime: StormDateTime = StormTime.current(),
  options?: Partial<Temporal.ToStringPrecisionOptions>
): string => {
  const smallestUnit = options?.smallestUnit || "milliseconds";
  const roundingMode = options?.roundingMode || "ceil";

  return dateTime.zonedDateTime.toPlainTime().toString({
    smallestUnit,
    roundingMode
  });
};
