/* eslint-disable @typescript-eslint/no-explicit-any */
import { Temporal } from "@js-temporal/polyfill";
import { JsonValue, Serializable } from "@storm-stack/serialization";
import {
  isBigInt,
  isDate,
  isNumber,
  isSetString
} from "@storm-stack/utilities";
import { RFC_3339_TIME_REGEX } from "./constants";
import type { DateTimeInput, DateTimeOptions } from "./storm-date-time";
import { StormDateTime } from "./storm-date-time";
import { isInstant } from "./utilities";

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
 */
@Serializable({
  serialize: serializeStormTime,
  deserialize: deserializeStormTime
})
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
    options?: DateTimeOptions
  ) =>
    new StormTime(time, {
      timeZone:
        (StormDateTime.isDateTime(time)
          ? time.timeZoneId
          : options?.timeZone) ?? Temporal.Now.timeZoneId(),
      calendar: StormDateTime.isDateTime(time)
        ? time.calendarId
        : options?.calendar
    });

  public constructor(dateTime?: DateTimeInput, options?: DateTimeOptions) {
    super(dateTime, options);

    const stormDateTime = StormDateTime.create(dateTime, options);
    this.instant = stormDateTime.instant
      .toZonedDateTimeISO("UTC")
      .with({
        year: 1970,
        month: 1,
        day: 1
      })
      .toInstant();
    this.zonedDateTime = stormDateTime.zonedDateTime.with({
      year: 1970,
      month: 1,
      day: 1
    });
  }

  /**
   * Validate the input time value
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
      let date!: Date;
      if (isNumber(value) || isBigInt(value)) {
        date = new Date(Number(value));
      } else {
        date = value;
      }

      if (isNaN(date.getTime())) {
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

    return RFC_3339_TIME_REGEX.test(datetime);
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
    return 1;
  }

  /**
   *  Gets the month of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCMonth(): number {
    return 1;
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
