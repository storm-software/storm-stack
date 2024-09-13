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

import { isError, isSetString } from "@storm-stack/types";
import type { StormError } from "../storm-error";

/**
 * Type-check to determine if `obj` is a `StormError` object
 *
 * @param value - the object to check
 * @returns The function isStormError is returning a boolean value.
 */
export function isStormError<TCode extends string = any>(
  value: unknown
): value is StormError<TCode> {
  return (
    isError(value) &&
    isSetString((value as unknown as StormError<TCode>)?.code) &&
    isSetString((value as unknown as StormError<TCode>)?.message) &&
    isSetString((value as unknown as StormError<TCode>)?.stack)
  );
}
