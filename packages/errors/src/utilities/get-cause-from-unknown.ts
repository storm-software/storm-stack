import { type Indexable, isError, isObject } from "@storm-stack/types";
import { ErrorCode } from "../errors";
import { StormError } from "../storm-error";
import { createStormError } from "./create-storm-error";
import { isStormError } from "./is-storm-error";

/**
 * Gets the cause of an unknown error and returns it as a StormError
 *
 * @param cause - The cause of the error in an unknown type
 * @returns The cause of the error in a StormError object or undefined
 */
export function getCauseFromUnknown(cause: unknown): StormError {
  if (isStormError(cause)) {
    return cause;
  }
  if (isError(cause)) {
    return createStormError({
      code: ErrorCode.internal_server_error,
      name: cause.name,
      message: cause.message,
      cause,
      stack: cause.stack
    });
  }
  const type = typeof cause;
  if (type === "undefined" || type === "function" || cause === null) {
    return new StormError(ErrorCode.internal_server_error, {
      cause
    });
  }

  // Primitive types just get wrapped in an error
  if (type !== "object") {
    return new StormError(ErrorCode.internal_server_error, {
      message: String(cause)
    });
  }

  // If it's an object, we'll create a synthetic error
  if (isObject(cause)) {
    const err = new StormError(ErrorCode.unknown_cause, {});
    for (const key in cause) {
      (err as Indexable)[key] = (cause as Indexable)[key];
    }
    return err;
  }

  return new StormError(ErrorCode.internal_server_error, { cause });
}
