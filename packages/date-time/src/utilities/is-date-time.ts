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

import { StormDateTime } from "../storm-date-time";

/**
 * Type-check to determine if `obj` is a `DateTime` object
 *
 * `isDateTime` returns true if the object passed to it has a `_symbol` property that is equal to
 * `DATE_TIME_SYMBOL`
 *
 * @param obj - the object to check
 * @returns The function isDateTime is returning a boolean value.
 */
export function isDateTime(obj: unknown): obj is StormDateTime {
  return StormDateTime.isDateTime(obj);
}
