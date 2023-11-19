import { JsonValue } from "@storm-software/serialization/types";
import { isSetString } from "@storm-software/utilities";
import { StormDate } from "../date";
import { StormDateTime } from "../date-time";
import { StormTime } from "../time";

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
export function deserializeStormDateTime(
  utcString: JsonValue
): StormDateTime | null {
  return isSetString(utcString) ? StormDateTime.create(utcString) : null;
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
export function deserializeStormDate(utcString: JsonValue): StormDate | null {
  return isSetString(utcString) ? StormDate.create(utcString) : null;
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
export function deserializeStormTime(utcString: JsonValue): StormTime | null {
  return isSetString(utcString) ? StormTime.create(utcString) : null;
}
