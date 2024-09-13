/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

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
