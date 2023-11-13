import { isDate } from "@storm-software/utilities/type-checks/is-date";
import { isSet } from "@storm-software/utilities/type-checks/is-set";
import { isSetString } from "@storm-software/utilities/type-checks/is-set-string";
import { DateTime } from "../date-time";

/**
 * Type-check to determine if `obj` is a `DateTime` object
 *
 * `isDateTime` returns true if the object passed to it has a `_symbol` property that is equal to
 * `DATE_TIME_SYMBOL`
 *
 * @param obj - the object to check
 * @returns The function isDateTime is returning a boolean value.
 */
export function isDateTime(obj: unknown): obj is DateTime {
  return (
    isDate(obj) &&
    isSet((obj as unknown as DateTime)?.instant) &&
    isSet((obj as unknown as DateTime)?.zonedDateTime) &&
    isSetString((obj as unknown as DateTime)?.timeZoneId)
  );
}
