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

import { ErrorCode } from "../errors";
import { StormError, type StormErrorOptions } from "../storm-error";
import { isStormError } from "./is-storm-error";

/**
 * Creates a new StormError instance
 *
 * @param cause - The cause of the error
 * @returns The newly created StormError
 */
export function createStormError<TCode extends string = string>({
  code,
  name,
  message,
  cause,
  stack,
  data
}: StormErrorOptions & { code?: TCode }): StormError<TCode> {
  if (isStormError(cause)) {
    return cause;
  }

  if (cause instanceof Error && cause.name === "StormError") {
    return cause as StormError<TCode>;
  }

  const stormError = new StormError<TCode>(
    (code ?? ErrorCode.internal_server_error) as TCode,
    {
      name,
      message,
      cause,
      stack,
      data
    }
  );

  // Inherit stack from error
  if (cause instanceof Error && cause.stack) {
    stormError.stack = cause.stack;
  }

  return stormError;
}
