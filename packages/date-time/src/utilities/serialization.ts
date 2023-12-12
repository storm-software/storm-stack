import { JsonValue } from "@storm-stack/serialization/types";
import { isSetString } from "@storm-stack/utilities/type-checks/is-set-string";
import { StormDate } from "../storm-date";
import { StormDateTime } from "../storm-date-time";
import { StormTime } from "../storm-time";

/**
 * Serializes a StormDateTime into a string
 *
 * @param dateTime - The dateTime to serialize
 * @returns The serialized dateTime
 */
export function serializeStormDateTime(dateTime: StormDateTime): string {
  return dateTime.instant.toJSON();
}

/**
 * Deserializes a string into a StormDateTime
 *
 * @param utcString - The dateTime to deserialize
 * @returns The deserialized dateTime
 */
export function deserializeStormDateTime(utcString: JsonValue): StormDateTime {
  return isSetString(utcString)
    ? StormDateTime.create(utcString)
    : StormDateTime.create();
}

/**
 * Serializes a StormDate into a string
 *
 * @param date - The date to serialize
 * @returns The serialized date
 */
export function serializeStormDate(date: StormDate): string {
  return date.instant.toJSON();
}

/**
 * Deserializes a string into a StormDate
 *
 * @param utcString - The date to deserialize
 * @returns The deserialized date
 */
export function deserializeStormDate(utcString: JsonValue): StormDate {
  return isSetString(utcString)
    ? StormDate.create(utcString)
    : StormDate.create();
}

/**
 * Serializes a StormTime into a string
 *
 * @param date - The time to serialize
 * @returns The serialized time
 */
export function serializeStormTime(date: StormTime): string {
  return date.instant.toJSON();
}

/**
 * Deserializes a string into a StormTime
 *
 * @param utcString - The time to deserialize
 * @returns The deserialized time
 */
export function deserializeStormTime(utcString: JsonValue): StormTime {
  return isSetString(utcString)
    ? StormTime.create(utcString)
    : StormTime.create();
}
