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

import { Temporal } from "@js-temporal/polyfill";
import { isFunction, isSet } from "@storm-stack/types";

/**
 * Type-check to determine if `value` is a `Temporal.Instant` object
 *
 * @param value - The value to check
 * @returns The function isInstant is returning a boolean value.
 */
export function isInstant(value: unknown): value is Temporal.Instant {
  return (
    isSet(value) &&
    (value instanceof Temporal.Instant ||
      isFunction((value as unknown as Temporal.Instant)?.toZonedDateTime))
  );
}
