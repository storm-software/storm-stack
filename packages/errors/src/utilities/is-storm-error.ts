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
