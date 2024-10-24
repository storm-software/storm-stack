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

import { Temporal } from "@js-temporal/polyfill";
import { type JsonValue, Serializable } from "@storm-stack/serialization";
import {
  isBigInt,
  isDate,
  isNumber,
  isSetString,
  MessageType,
  ValidationDetails
} from "@storm-stack/types";
import {
  DATE_TIME_INVALID_DATE,
  RFC_3339_DATE_TIME_REGEX,
  RFC_3339_TIME_REGEX
} from "./constants";
import { DateTimeErrorCode } from "./errors";
import type { DateTimeInput, DateTimeOptions } from "./storm-date-time";
import { StormDateTime } from "./storm-date-time";
import { isInstant } from "./utilities/is-instant";

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

/**
 * A wrapper of the and Date class used by Storm Software to provide Date-Time values
 *
 * @decorator `@Serializable()`
 * @class StormTime
 */
@Serializable()
export class StormTime extends StormDateTime {
  /**
   * The current function returns a new DateTime object with the current date and time
   * @returns A new instance of DateTime with the current date and time.
   */
  public static override now(): number {
    return StormTime.current().epochMilliseconds;
  }

  /**
   * The current function returns a new DateTime object with the current date and time
   * @returns A new instance of DateTime with the current date and time.
   */
  public static override current(): StormTime {
    return StormTime.create(Temporal.Now.instant());
  }

  /**
   * Creates a new instance of DateTime from a string with a specified format.
   *
   * @param time - The input value used to determine the current time
   * @param options - The options to use
   * @returns A new instance of StormTime with the time provided in the time parameter.
   */
  public static override create = (
    time?: DateTimeInput,
    options: DateTimeOptions = {}
  ) =>
    new StormTime(time, {
      ...options,
      timeZone: StormDateTime.isDateTime(time) ? time.timeZoneId : undefined,
      calendar: StormDateTime.isDateTime(time) ? time.calendarId : undefined
    });

  /**
   * Validate the input time value
   *
   * @param dateTime - The date value to validate
   * @returns A boolean representing whether the value is a valid *date-time*
   */
  public static override validate(
    value?: DateTimeInput
  ): ValidationDetails | null {
    if (
      (isDate(value) || StormDateTime.isDateTime(value)) &&
      value.toString() === DATE_TIME_INVALID_DATE
    ) {
      return {
        code: DateTimeErrorCode.rfc_3339_format,
        type: MessageType.ERROR
      };
    }

    if (StormDateTime.isDateTime(value)) {
      return value.validate();
    }

    if (isInstant(value)) {
      if (value.epochMilliseconds) {
        return null;
      }

      return {
        code: DateTimeErrorCode.invalid_instant,
        type: MessageType.ERROR
      };
    }

    let datetime: string | undefined;
    if (isDate(value) || isNumber(value) || isBigInt(value)) {
      const date =
        isNumber(value) || isBigInt(value) ? new Date(Number(value)) : value;

      if (Number.isNaN(date.getTime())) {
        return {
          code: DateTimeErrorCode.invalid_time,
          type: MessageType.ERROR
        };
      }

      datetime = date.toISOString();
    } else {
      datetime =
        value === null || value === void 0 ? void 0 : value.toUpperCase();
    }

    if (!datetime) {
      return {
        code: DateTimeErrorCode.invalid_value,
        type: MessageType.ERROR
      };
    }

    // Validate the structure of the date-string
    if (
      !RFC_3339_TIME_REGEX.test(datetime) &&
      !RFC_3339_DATE_TIME_REGEX.test(datetime)
    ) {
      return {
        code: DateTimeErrorCode.rfc_3339_format,
        type: MessageType.ERROR
      };
    }

    // Success - Valid
    return null;
  }

  public constructor(dateTime?: DateTimeInput, options: DateTimeOptions = {}) {
    super(dateTime, options);

    const stormDateTime = StormDateTime.create(dateTime, options);
    this.instant = stormDateTime.instant
      .toZonedDateTimeISO(
        options.timeZone ||
          stormDateTime.timeZoneId ||
          StormDateTime.getDefaultTimeZone()
      )
      .with({
        year: 1970,
        month: 0,
        day: 1
      })
      .toInstant();
    this.zonedDateTime = stormDateTime.zonedDateTime.with({
      year: 1970,
      month: 0,
      day: 1
    });
  }

  /**
   * A function that validates the current Time object
   *
   * @returns A ValidationDetails object if the Time object is invalid, otherwise null
   */
  public override validate(): ValidationDetails | null {
    return StormTime.validate(this.zonedDateTime.epochMilliseconds);
  }

  /**
   *  Gets the year, using local time.
   */
  public override getFullYear(): number {
    return 1970;
  }

  /**
   *  Gets the year using Universal Coordinated Time (UTC).
   */
  public override getUTCFullYear(): number {
    return 1970;
  }

  /**
   *  Gets the month, using local time.
   */
  public override getMonth(): number {
    return 0;
  }

  /**
   *  Gets the month of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCMonth(): number {
    return 0;
  }

  /**
   *  Gets the day-of-the-month, using local time.
   */
  public override getDate(): number {
    return 1;
  }

  /**
   *  Gets the day-of-the-month, using Universal Coordinated Time (UTC).
   */
  public override getUTCDate(): number {
    return 1;
  }

  /**
   *  Gets the day of the week, using local time.
   */
  public override getDay(): number {
    return 1;
  }

  /**
   *  Gets the day of the week using Universal Coordinated Time (UTC).
   */
  public override getUTCDay(): number {
    return 1;
  }

  /**
   * It returns the duration between two dates.
   *
   * @param dateTimeTo - DateTime = DateTime.current
   * @returns A duration object.
   */
  public override getDuration(
    dateTimeTo: StormTime = StormTime.current()
  ): Temporal.Duration {
    return this.instant.since(dateTimeTo.instant);
  }
}
