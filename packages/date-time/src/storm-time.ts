/* eslint-disable @typescript-eslint/no-explicit-any */
import { Temporal } from "@js-temporal/polyfill";
import { Serializable } from "@storm-stack/serialization";
import type { DateTimeInput, DateTimeOptions } from "./storm-date-time";
import { StormDateTime } from "./storm-date-time";
import { validateTime } from "./utilities";
import { isDateTime } from "./utilities/is-date-time";
import {
  deserializeStormTime,
  serializeStormTime
} from "./utilities/serialization";

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
        (isDateTime(time) ? time.timeZoneId : options?.timeZone) ??
        Temporal.Now.timeZoneId(),
      calendar: isDateTime(time) ? time.calendarId : options?.calendar
    });

  public constructor(dateTime?: DateTimeInput, options?: DateTimeOptions) {
    super(dateTime, options);

    this.instant = super.instant
      .toZonedDateTimeISO("UTC")
      .with({
        year: 1970,
        month: 1,
        day: 1
      })
      .toInstant();
    this.zonedDateTime = super.zonedDateTime.with({
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
    dateTime?: DateTimeInput,
    options?: DateTimeOptions
  ): boolean {
    return validateTime(dateTime, options);
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
