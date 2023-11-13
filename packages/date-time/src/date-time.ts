/* eslint-disable @typescript-eslint/no-explicit-any */
import { Temporal } from "@js-temporal/polyfill";
import { isBigInt } from "@storm-software/utilities/type-checks/is-bigint";
import { isDate } from "@storm-software/utilities/type-checks/is-date";
import { isNumber } from "@storm-software/utilities/type-checks/is-number";
import { isDateTime } from "./is-date-time";

/**
 * A wrapper of the and Date class
 */
export class DateTime extends Date {
  /**
   * Conditional function to determine if `obj` is a valid `DateTime` object (i.e. the inner date value is set to a valid date and/or time)
   *
   * `isValid` is a function that takes an object of type `any` and returns a boolean
   *
   * @param obj - any - the object to check
   * @returns A function that returns a boolean.
   */
  public static isValid(obj: unknown): obj is DateTime {
    return isDateTime(obj);
  }

  /**
   * The current function returns a new DateTime object with the current date and time
   * @returns A new instance of DateTime with the current date and time.
   */
  public static override now(): number {
    return DateTime.current().epochMilliseconds;
  }

  /**
   * The current function returns a new DateTime object with the current date and time
   * @returns A new instance of DateTime with the current date and time.
   */
  public static current(): DateTime {
    return DateTime.create(Temporal.Now.instant());
  }

  public static create = (
    dateTime:
      | DateTime
      | Temporal.Instant
      | Date
      | string
      | number
      | bigint
      | null
      | undefined = DateTime.current(),
    options?: {
      timeZone?: Temporal.TimeZoneLike;
      calendar?: Temporal.CalendarLike;
    }
  ) =>
    new DateTime(dateTime, {
      timeZone:
        (isDateTime(dateTime) ? dateTime.timeZoneId : options?.timeZone) ??
        Temporal.Now.timeZoneId(),
      calendar: isDateTime(dateTime) ? dateTime.calendarId : options?.calendar
    });

  #instant: Temporal.Instant;
  #zonedDateTime: Temporal.ZonedDateTime;

  protected constructor(
    dateTime:
      | DateTime
      | Temporal.Instant
      | Date
      | string
      | number
      | bigint
      | null
      | undefined = DateTime.current(),
    {
      timeZone,
      calendar
    }: {
      timeZone: Temporal.TimeZoneLike;
      calendar?: Temporal.CalendarLike;
    } = { timeZone: Temporal.Now.timeZoneId() }
  ) {
    const instant = dateTime
      ? isDateTime(dateTime)
        ? dateTime.instant
        : Temporal.Instant.from(
            isDate(dateTime)
              ? dateTime.toUTCString()
              : isNumber(dateTime) || isBigInt(dateTime)
              ? new Date(Number(dateTime)).toISOString()
              : dateTime
          )
      : Temporal.Now.instant();

    super(Number(instant.epochMilliseconds));

    this.#instant = instant;
    this.#zonedDateTime = calendar
      ? this.#instant.toZonedDateTime({
          timeZone,
          calendar
        })
      : this.#instant.toZonedDateTimeISO(timeZone);
  }

  /**
   * An accessor that returns the epoch milliseconds of the DateTime object
   */
  public get epochMilliseconds(): number {
    return this.instant.epochMilliseconds;
  }

  /**
   * An accessor that returns the `Temporal.Instant` object of the DateTime object
   */
  public get instant(): Temporal.Instant {
    return this.#instant;
  }

  /**
   * An accessor that returns the `Temporal.ZonedDateTime` object of the DateTime object
   */
  public get zonedDateTime(): Temporal.ZonedDateTime {
    return this.#zonedDateTime;
  }

  /**
   * An accessor that returns the `calendarId` string of the DateTime object
   */
  public get calendarId(): string {
    return this.#zonedDateTime.calendarId;
  }

  /**
   * An accessor that returns the `timeZoneId` string of the DateTime object
   */
  public get timeZoneId(): string {
    return this.#zonedDateTime.timeZoneId;
  }

  /**
   * Sets the date and time value in the Date object.
   * @param time - A numeric value representing the number of elapsed milliseconds since midnight, January 1, 1970 GMT.
   */
  public override setTime(time: number): number {
    this.#zonedDateTime = this.#zonedDateTime.add({
      milliseconds: time - this.epochMilliseconds
    });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setTime(this.#instant.epochMilliseconds);
  }

  /**
   * Sets the milliseconds value in the Date object using local time.
   * @param millisecond - A numeric value equal to the millisecond value.
   */
  public override setMilliseconds(millisecond: number): number {
    this.#zonedDateTime = this.#zonedDateTime.with({ millisecond });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setMilliseconds(
      this.#instant.toZonedDateTimeISO("UTC").millisecond
    );
  }

  /**
   * Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC).
   * @param millisecond - A numeric value equal to the millisecond value.
   */
  public override setUTCMilliseconds(millisecond: number): number {
    this.#instant = this.#instant
      .toZonedDateTimeISO("UTC")
      .with({ millisecond })
      .toInstant();
    this.#zonedDateTime = this.#instant.toZonedDateTime({
      timeZone: this.timeZoneId,
      calendar: this.calendarId
    });

    return super.setUTCMilliseconds(
      this.#instant.toZonedDateTimeISO("UTC").millisecond
    );
  }

  /**
   * Sets the seconds value in the Date object using local time.
   * @param second -  A numeric value equal to the seconds value.
   * @param millisecond - A numeric value equal to the milliseconds value.
   */
  public override setSeconds(second: number, millisecond?: number): number {
    this.#zonedDateTime = this.#zonedDateTime.with({ second, millisecond });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setSeconds(
      this.#zonedDateTime.second,
      this.#zonedDateTime.millisecond
    );
  }

  /**
   * Sets the seconds value in the Date object using Universal Coordinated Time (UTC).
   * @param second - A numeric value equal to the seconds value.
   * @param millisecond - A numeric value equal to the milliseconds value.
   */
  public override setUTCSeconds(second: number, millisecond?: number): number {
    this.#instant = this.#instant
      .toZonedDateTimeISO("UTC")
      .with({ second, millisecond })
      .toInstant();
    this.#zonedDateTime = this.#instant.toZonedDateTime({
      timeZone: this.timeZoneId,
      calendar: this.calendarId
    });

    const utcDateTime = this.#instant.toZonedDateTimeISO("UTC");
    return super.setUTCSeconds(utcDateTime.second, utcDateTime.millisecond);
  }

  /**
   * Sets the minutes value in the Date object using local time.
   * @param minute - A numeric value equal to the minutes value.
   * @param second - A numeric value equal to the seconds value.
   * @param millisecond - A numeric value equal to the milliseconds value.
   */
  public override setMinutes(
    minute: number,
    second?: number,
    millisecond?: number
  ): number {
    this.#zonedDateTime = this.#zonedDateTime.with({
      minute,
      second,
      millisecond
    });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setMinutes(
      this.#zonedDateTime.minute,
      this.#zonedDateTime.second,
      this.#zonedDateTime.millisecond
    );
  }

  /**
   * Sets the minutes value in the Date object using Universal Coordinated Time (UTC).
   * @param minute - A numeric value equal to the minutes value.
   * @param second - A numeric value equal to the seconds value.
   * @param millisecond - A numeric value equal to the milliseconds value.
   */
  public override setUTCMinutes(
    minute: number,
    second?: number,
    millisecond?: number
  ): number {
    this.#instant = this.#instant
      .toZonedDateTimeISO("UTC")
      .with({ minute, second, millisecond })
      .toInstant();
    this.#zonedDateTime = this.#instant.toZonedDateTime({
      timeZone: this.timeZoneId,
      calendar: this.calendarId
    });

    const utcDateTime = this.#instant.toZonedDateTimeISO("UTC");
    return super.setUTCMinutes(
      utcDateTime.minute,
      utcDateTime.second,
      utcDateTime.millisecond
    );
  }

  /**
   * Sets the hour value in the Date object using local time.
   *
   * @param hour - A numeric value equal to the hours value.
   * @param minute - A numeric value equal to the minutes value.
   * @param second - A numeric value equal to the seconds value.
   * @param millisecond - A numeric value equal to the milliseconds value.
   */
  public override setHours(
    hour: number,
    minute: number,
    second?: number,
    millisecond?: number
  ): number {
    this.#zonedDateTime = this.#zonedDateTime.with({
      hour,
      minute,
      second,
      millisecond
    });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setHours(
      this.#zonedDateTime.hour,
      this.#zonedDateTime.minute,
      this.#zonedDateTime.second,
      this.#zonedDateTime.millisecond
    );
  }

  /**
   * Sets the hours value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param hour - A numeric value equal to the hours value.
   * @param minute - A numeric value equal to the minutes value.
   * @param second - A numeric value equal to the seconds value.
   * @param millisecond - A numeric value equal to the milliseconds value.
   */
  public override setUTCHours(
    hour: number,
    minute: number,
    second?: number,
    millisecond?: number
  ): number {
    this.#instant = this.#instant
      .toZonedDateTimeISO("UTC")
      .with({ hour, minute, second, millisecond })
      .toInstant();
    this.#zonedDateTime = this.#instant.toZonedDateTime({
      timeZone: this.timeZoneId,
      calendar: this.calendarId
    });

    const utcDateTime = this.#instant.toZonedDateTimeISO("UTC");
    return super.setUTCHours(
      utcDateTime.hour,
      utcDateTime.minute,
      utcDateTime.second,
      utcDateTime.millisecond
    );
  }

  /**
   * Sets the numeric day-of-the-month value of the Date object using local time.
   *
   * @param day - A numeric value equal to the day of the month.
   */
  public override setDate(day: number): number {
    this.#zonedDateTime = this.#zonedDateTime.with({
      day
    });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setDate(this.#zonedDateTime.day);
  }

  /**
   * Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC).
   *
   * @param day - A numeric value equal to the day of the month.
   */
  public override setUTCDate(day: number): number {
    this.#instant = this.#instant
      .toZonedDateTimeISO("UTC")
      .with({ day })
      .toInstant();
    this.#zonedDateTime = this.#instant.toZonedDateTime({
      timeZone: this.timeZoneId,
      calendar: this.calendarId
    });

    return super.setUTCDate(this.#instant.toZonedDateTimeISO("UTC").day);
  }

  /**
   * Sets the month value in the Date object using local time.
   *
   * @param month - A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
   * @param day - A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
   */
  public override setMonth(month: number, day?: number): number {
    this.#zonedDateTime = this.#zonedDateTime.with({ month, day });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setMonth(this.#zonedDateTime.month, this.#zonedDateTime.day);
  }

  /**
   * Sets the month value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param month - A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
   * @param day - A numeric value representing the day of the month. If it is not supplied, the value from a call to the getUTCDate method is used.
   */
  public override setUTCMonth(month: number, day?: number): number {
    this.#instant = this.#instant
      .toZonedDateTimeISO("UTC")
      .with({ month, day })
      .toInstant();
    this.#zonedDateTime = this.#instant.toZonedDateTime({
      timeZone: this.timeZoneId,
      calendar: this.calendarId
    });

    const utcDateTime = this.#instant.toZonedDateTimeISO("UTC");
    return super.setUTCMonth(utcDateTime.month, utcDateTime.day);
  }

  /**
   * Sets the year of the Date object using local time.
   * @param year - A numeric value for the year.
   * @param month - A zero-based numeric value for the month (0 for January, 11 for December). Must be specified if numDate is specified.
   * @param day - A numeric value equal for the day of the month.
   */
  public override setFullYear(
    year: number,
    month?: number,
    day?: number
  ): number {
    this.#zonedDateTime = this.#zonedDateTime.with({ year, month, day });
    this.#instant = this.#zonedDateTime.toInstant();

    return super.setFullYear(
      this.#zonedDateTime.year,
      this.#zonedDateTime.month,
      this.#zonedDateTime.day
    );
  }

  /**
   * Sets the year value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param year - A numeric value equal to the year.
   * @param month - A numeric value equal to the month. The value for January is 0, and other month values follow consecutively. Must be supplied if numDate is supplied.
   * @param day - A numeric value equal to the day of the month.
   */
  public override setUTCFullYear(
    year: number,
    month?: number,
    day?: number
  ): number {
    this.#instant = this.#instant
      .toZonedDateTimeISO("UTC")
      .with({ year, month, day })
      .toInstant();
    this.#zonedDateTime = this.#instant.toZonedDateTime({
      timeZone: this.timeZoneId,
      calendar: this.calendarId
    });

    const utcDateTime = this.#instant.toZonedDateTimeISO("UTC");
    return super.setUTCFullYear(
      utcDateTime.year,
      utcDateTime.month,
      utcDateTime.day
    );
  }

  /**
   * It returns a plain date object from a DateTime object
   *
   * @returns A PlainDate object.
   */
  public getPlainDate(): DateTime {
    return DateTime.create(
      this.#zonedDateTime.toPlainDate().toZonedDateTime({
        timeZone: Temporal.Now.timeZoneId(),
        plainTime: undefined
      }).epochMilliseconds,
      {
        timeZone: this.#zonedDateTime.timeZoneId,
        calendar: this.#zonedDateTime.calendarId
      }
    );
  }

  /**
   * `getPlainTime` returns a `PlainTime` object from a `DateTime` object
   *
   * @returns A PlainTime object.
   */
  public getPlainTime(): DateTime {
    return DateTime.create(
      this.#zonedDateTime.toPlainTime().toZonedDateTime({
        timeZone: Temporal.Now.timeZoneId(),
        plainDate: Temporal.PlainDate.from({
          year: 1970,
          month: 0,
          day: 1
        })
      }).epochMilliseconds,
      {
        timeZone: this.#zonedDateTime.timeZoneId,
        calendar: this.#zonedDateTime.calendarId
      }
    );
  }

  /**
   * It returns the duration between two dates.
   *
   * @param dateTimeTo - DateTime = DateTime.current
   * @returns A duration object.
   */
  public getDuration(
    dateTimeTo: DateTime = DateTime.current()
  ): Temporal.Duration {
    return this.#instant.since(dateTimeTo.instant);
  }
}
