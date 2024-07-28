/* eslint-disable @typescript-eslint/no-explicit-any */
import { Temporal } from "@js-temporal/polyfill";
import { type JsonValue, Serializable } from "@storm-stack/serialization";
import { isBigInt, isDate, isNumber, isSetString } from "@storm-stack/types";
import { RFC_3339_DATE_REGEX } from "./constants";
import type { DateTimeInput, DateTimeOptions } from "./storm-date-time";
import { StormDateTime } from "./storm-date-time";
import { isInstant } from "./utilities/is-instant";

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
export class StormDate extends StormDateTime {
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
   * Creates a new StormDate object with the given date and time
   *
   * @param date - The date to use
   * @param options - The options to use
   * @returns A new instance of DateTime with the given date and time.
   */
  public static override create = (
    date?: DateTimeInput,
    options?: DateTimeOptions
  ) =>
    new StormDate(date, {
      timeZone:
        (StormDateTime.isDateTime(date)
          ? date.timeZoneId
          : options?.timeZone) ?? Temporal.Now.timeZoneId(),
      calendar: StormDateTime.isDateTime(date)
        ? date.calendarId
        : options?.calendar
    });

  public constructor(dateTime?: DateTimeInput, options?: DateTimeOptions) {
    super(dateTime, options);

    const stormDateTime = StormDateTime.create(dateTime, options);
    this.instant = stormDateTime.instant
      .toZonedDateTimeISO("UTC")
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
   * Validate the input date value
   *
   * @param dateTime - The date value to validate
   * @param options - The options to use
   * @returns A boolean representing whether the value is a valid *date-time*
   */
  protected override validate(
    value?: DateTimeInput,
    options?: DateTimeOptions
  ): boolean {
    if (StormDateTime.isDateTime(value)) {
      return value.isValid;
    }
    if (isInstant(value)) {
      return !!value.epochMilliseconds;
    }

    let datetime: string | undefined;
    if (isDate(value) || isNumber(value) || isBigInt(value)) {
      const date =
        isNumber(value) || isBigInt(value) ? new Date(Number(value)) : value;

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      datetime = date.toUTCString();
    } else {
      datetime =
        value === null || value === void 0 ? void 0 : value.toUpperCase();
    }

    if (!datetime) {
      return false;
    }

    if (!RFC_3339_DATE_REGEX.test(datetime)) {
      return false;
    }

    const createdDateTime = StormDateTime.create(value, options);
    switch (createdDateTime.zonedDateTime.month) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12: {
        return createdDateTime.zonedDateTime.day > 31;
      }

      case 2: {
        return (
          createdDateTime.zonedDateTime.day >
          (createdDateTime.zonedDateTime.inLeapYear ? 29 : 28)
        );
      }

      case 4:
      case 6:
      case 9:
      case 11: {
        return createdDateTime.zonedDateTime.day > 30;
      }

      default: {
        return true;
      }
    }
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
