/* eslint-disable @typescript-eslint/no-explicit-any */
import { Temporal } from "@js-temporal/polyfill";
import { Serializable } from "@storm-stack/serialization/serializable";
import type { DateTimeInput, DateTimeOptions } from "./storm-date-time";
import { StormDateTime } from "./storm-date-time";
import { isDateTime } from "./utilities/is-date-time";
import {
  deserializeStormDate,
  serializeStormDate
} from "./utilities/serialization";
import { validateDate } from "./utilities/validate-date";

/**
 * A wrapper of the and Date class used by Storm Software to provide Date-Time values
 *
 * @decorator `@Serializable()`
 */
@Serializable({
  name: "StormDate",
  serialize: serializeStormDate,
  deserialize: deserializeStormDate
})
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
        (isDateTime(date) ? date.timeZoneId : options?.timeZone) ??
        Temporal.Now.timeZoneId(),
      calendar: isDateTime(date) ? date.calendarId : options?.calendar
    });

  public constructor(dateTime?: DateTimeInput, options?: DateTimeOptions) {
    super(dateTime, options);

    this.instant = this.instant
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
    this.zonedDateTime = this.zonedDateTime.with({
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
    dateTime?: DateTimeInput,
    options?: DateTimeOptions
  ): boolean {
    return validateDate(dateTime, options);
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
