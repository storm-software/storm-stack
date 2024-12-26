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
  RFC_3339_DATE_REGEX,
  RFC_3339_DATE_TIME_REGEX
} from "./constants";
import { DateTimeErrorCode } from "./errors";
import type { DateTimeInput, DateTimeOptions } from "./storm-date-time";
import { StormDateTime } from "./storm-date-time";
import { isInstant } from "./utilities/is-instant";
import { validateDayOfMonth } from "./utilities/validate-day-of-month";

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
 * A wrapper of the and Date class used by Storm Software to provide Date-Time values
 *
 * @decorator `@Serializable()`
 * @class StormDate
 */
@Serializable()
class StormDate extends StormDateTime {
  /**
   * The current function returns a new DateTime object with the current date and time
   * @returns A new instance of DateTime with the current date and time.
   */
  public static override now(): number {
    return StormDate.current().epochMilliseconds;
  }

  /**
   * The current function returns a new DateTime object with the current date and time
   * @returns A new instance of DateTime with the current date and time.
   */
  public static override current(): StormDate {
    return StormDate.create(Temporal.Now.instant());
  }

  /**
   * The maximum function returns a new StormDateTime object with the maximum date and time
   *
   * @returns A new instance of StormDateTime with the maximum date and time.
   */
  public static override minimum(): StormDate {
    return StormDate.create(new Date(-8_640_000_000_000_000));
  }

  /**
   * The maximum function returns a new StormDateTime object with the maximum date and time
   *
   * @returns A new instance of StormDateTime with the maximum date and time.
   */
  public static override maximum(): StormDate {
    return StormDate.create(new Date(8_640_000_000_000_000));
  }

  /**
   * Validate the input date value
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
      !RFC_3339_DATE_REGEX.test(datetime) &&
      !RFC_3339_DATE_TIME_REGEX.test(datetime)
    ) {
      return {
        code: DateTimeErrorCode.rfc_3339_format,
        type: MessageType.ERROR
      };
    }

    return validateDayOfMonth(StormDate.create(value));
  }

  /**
   * Creates a new StormDate object with the given date and time
   *
   * @param date - The date to use
   * @param options - The options to use
   * @returns A new instance of DateTime with the given date and time.
   */
  public static override create(
    date?: DateTimeInput,
    options: DateTimeOptions = {}
  ) {
    return new StormDate(date, {
      ...options,
      timeZone: StormDateTime.isDateTime(date) ? date.timeZoneId : undefined,
      calendar: StormDateTime.isDateTime(date) ? date.calendarId : undefined
    });
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
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0
      })
      .toInstant();
    this.zonedDateTime = stormDateTime.zonedDateTime.with({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      microsecond: 0,
      nanosecond: 0
    });
  }

  /**
   * A function that validates the current Date object
   *
   * @returns A ValidationDetails object if the Date object is invalid, otherwise null
   */
  public override validate(): ValidationDetails | null {
    return StormDate.validate(this.zonedDateTime.epochMilliseconds);
  }

  /**
   *  Gets the hours in a date, using local time.
   */
  public override getHours(): number {
    return 0;
  }

  /**
   *  Gets the hours value in a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCHours(): number {
    return 0;
  }

  /**
   *  Gets the minutes of a Date object, using local time.
   */
  public override getMinutes(): number {
    return 0;
  }

  /**
   *  Gets the minutes of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCMinutes(): number {
    return 0;
  }

  /**
   *  Gets the seconds of a Date object, using local time.
   */
  public override getSeconds(): number {
    return 0;
  }

  /**
   *  Gets the seconds of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCSeconds(): number {
    return 0;
  }

  /**
   *  Gets the milliseconds of a Date, using local time.
   */
  public override getMilliseconds(): number {
    return 0;
  }

  /**
   *  Gets the milliseconds of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCMilliseconds(): number {
    return 0;
  }

  /**
   *  Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC).
   */
  public override getTimezoneOffset(): number {
    return 0;
  }

  /**
   * It returns the duration between two dates.
   *
   * @param dateTimeTo - DateTime = DateTime.current
   * @returns A duration object.
   */
  public override getDuration(
    dateTimeTo: StormDateTime = StormDate.current()
  ): Temporal.Duration {
    return this.instant.since(dateTimeTo.instant);
  }
}

export { StormDate };
