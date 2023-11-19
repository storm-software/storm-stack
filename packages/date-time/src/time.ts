/* eslint-disable @typescript-eslint/no-explicit-any */
import { Temporal } from "@js-temporal/polyfill";
import { Serializable } from "@storm-software/serialization/serializable";
import { DateTimeInput, DateTimeOptions, StormDateTime } from "./date-time";
import { validateTime } from "./utilities";
import { isDateTime } from "./utilities/is-date-time";
import {
  deserializeStormTime,
  serializeStormTime
} from "./utilities/serialization";

/**
 * A wrapper of the and Date class
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
    return StormDateTime.current().epochMilliseconds;
  }

  /**
   * The current function returns a new DateTime object with the current date and time
   * @returns A new instance of DateTime with the current date and time.
   */
  public static override current(): StormTime {
    return StormTime.create(Temporal.Now.instant());
  }

  public static override create = (
    dateTime?: DateTimeInput,
    options?: DateTimeOptions
  ) =>
    new StormTime(dateTime, {
      timeZone:
        (isDateTime(dateTime) ? dateTime.timeZoneId : options?.timeZone) ??
        Temporal.Now.timeZoneId(),
      calendar: isDateTime(dateTime) ? dateTime.calendarId : options?.calendar
    });

  public constructor(dateTime?: DateTimeInput, options?: DateTimeOptions) {
    super(dateTime, options);

    this.instant = this.instant
      .toZonedDateTimeISO("UTC")
      .with({
        year: 1970,
        month: 1,
        day: 1
      })
      .toInstant();
    this.zonedDateTime = this.zonedDateTime.with({
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
