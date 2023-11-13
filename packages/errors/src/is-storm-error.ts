import { isError } from "@storm-software/utilities/type-checks/is-error";
import { isSetString } from "@storm-software/utilities/type-checks/is-set-string";
import { StormError } from "./storm-error";

/**
 * Type-check to determine if `obj` is a `StormError` object
 *
 * @param obj - the object to check
 * @returns The function isStormError is returning a boolean value.
 */
export function isStormError<TCode extends string = any>(
  obj: unknown
): obj is StormError<TCode> {
  return (
    isError(obj) &&
    isSetString((obj as unknown as StormError<TCode>)?.code) &&
    isSetString((obj as unknown as StormError<TCode>)?.message) &&
    isSetString((obj as unknown as StormError<TCode>)?.stack)
  );
}
