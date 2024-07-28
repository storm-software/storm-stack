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
