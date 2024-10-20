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
  isObject,
  isSet,
  isSetString,
  MessageType,
  ValidationDetails
} from "@storm-stack/types";
import { RFC_3339_DATETIME_REGEX } from "./constants";
import { DateTimeErrorCode } from "./errors";
import { isInstant } from "./utilities/is-instant";
import { validateDayOfMonth } from "./utilities/validate-day-of-month";

/**
 * The options to use when creating a new DateTime object
 */
export interface DateTimeOptions {
  /**
   * The time zone to use. If not specified, the default time zone for the runtime is used.
   */
  timeZone?: Temporal.TimeZoneLike;

  /**
   * The calendar to use. If not specified, the default calendar for the runtime is used.
   */
  calendar?: Temporal.CalendarLike;

  /**
   * If false, the current date and time is defaulted when undefined or null is passed. If true, the current date and time is not defaulted.
   *
   * @defaultValue false
   */
  defaultToNow?: boolean;
}

/**
 * The input types that can be used to create a DateTime object
 */
export type DateTimeInput =
  | StormDateTime
  | Temporal.Instant
  | Date
  | string
  | number
  | bigint
  | null
  | undefined;

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
 * A wrapper of the and Date class used by Storm Software to provide Date-Time values
 *
 * @decorator `@Serializable()`
 * @class StormDateTime
 */
@Serializable()
export class StormDateTime extends Date {
  /**
   * A helper function to get the default time zone
   *
   * @returns The default time zone
   */
  public static getDefaultTimeZone(): string {
    return (
      Temporal.Now.timeZoneId() ||
      process.env.STORM_TIMEZONE ||
      process.env.DEFAULT_TIMEZONE ||
      process.env.TZ ||
      "UTC"
    );
  }

  /**
   * Type-check to determine if `obj` is a `DateTime` object
   *
   * `isDateTime` returns true if the object passed to it has a `_symbol` property that is equal to
   * `DATE_TIME_SYMBOL`
   *
   * @param obj - the object to check
   * @returns The function isDateTime is returning a boolean value.
   */
  public static isDateTime(obj: unknown): obj is StormDateTime {
    return (
      isDate(obj) &&
      isSet((obj as unknown as StormDateTime)?.instant) &&
      isSet((obj as unknown as StormDateTime)?.zonedDateTime) &&
      isSetString((obj as unknown as StormDateTime)?.timeZoneId)
    );
  }

  /**
   * The current function returns a new StormDateTime object with the current date and time
   *
   * @returns A new instance of StormDateTime with the current date and time.
   */
  public static override now(): number {
    return StormDateTime.current().epochMilliseconds;
  }

  /**
   * The current function returns a new StormDateTime object with the current date and time
   *
   * @returns A new instance of StormDateTime with the current date and time.
   */
  public static current(): StormDateTime {
    return StormDateTime.create(Temporal.Now.instant());
  }

  /**
   * The maximum function returns a new StormDateTime object with the maximum date and time
   *
   * @returns A new instance of StormDateTime with the maximum date and time.
   */
  public static minimum(): StormDateTime {
    return StormDateTime.create(new Date(-8_640_000_000_000_000));
  }

  /**
   * The maximum function returns a new StormDateTime object with the maximum date and time
   *
   * @returns A new instance of StormDateTime with the maximum date and time.
   */
  public static maximum(): StormDateTime {
    return StormDateTime.create(new Date(8_640_000_000_000_000));
  }

  /**
   * Creates a new instance of StormDateTime from a string with a specified format.
   *
   * @param dateTime - The input value used to determine the current date and time
   * @param options - The options to use when creating the StormDateTime object
   * @returns A new instance of StormDateTime with the current date and time.
   */
  public static create = (
    dateTime?: DateTimeInput,
    options: DateTimeOptions = {}
  ) =>
    new StormDateTime(dateTime, {
      ...options,
      timeZone: StormDateTime.isDateTime(dateTime)
        ? dateTime.timeZoneId
        : options?.timeZone,
      calendar: StormDateTime.isDateTime(dateTime)
        ? dateTime.calendarId
        : options?.calendar
    });

  /**
   * Validate the input date value
   *
   * @param dateTime - The date value to validate
   * @param _options - The options to use
   * @returns A boolean representing whether the value is a valid *date-time*
   */
  public static validate(
    value?: DateTimeInput,
    options?: DateTimeOptions
  ): ValidationDetails | null {
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
    if (!RFC_3339_DATETIME_REGEX.test(datetime)) {
      return {
        code: DateTimeErrorCode.rfc_3339_format,
        type: MessageType.ERROR
      };
    }

    // Check if it is a correct date using the javascript Date parse() method.
    if (!Date.parse(datetime)) {
      return {
        code: DateTimeErrorCode.rfc_3339_format,
        type: MessageType.ERROR
      };
    }

    return validateDayOfMonth(StormDateTime.create(value, options));
  }

  /**
   * A private accessor that stores the `Temporal.Instant` object of the DateTime object
   */
  #instant: Temporal.Instant = Temporal.Now.instant();

  /**
   * A private accessor that stores the `Temporal.ZonedDateTime` object of the DateTime object
   */
  #zonedDateTime: Temporal.ZonedDateTime = Temporal.Now.zonedDateTime(
    new Intl.DateTimeFormat().resolvedOptions().calendar,
    StormDateTime.getDefaultTimeZone()
  );

  /**
   * A private accessor that stores the input value used to create the DateTime object
   */
  #input: DateTimeInput;

  /**
   * A private accessor that stores the options used to create the DateTime object
   */
  #options: DateTimeOptions;

  public constructor(dateTime?: DateTimeInput, options: DateTimeOptions = {}) {
    let _dateTime = dateTime;

    options.timeZone ??= StormDateTime.getDefaultTimeZone();
    options.calendar ??= new Intl.DateTimeFormat().resolvedOptions().calendar;

    const input = dateTime;
    if (!_dateTime && options?.defaultToNow) {
      _dateTime = Temporal.Now.instant();
    }

    const instant = _dateTime
      ? StormDateTime.isDateTime(_dateTime)
        ? _dateTime.instant
        : Temporal.Instant.from(
            isDate(_dateTime)
              ? _dateTime.toJSON()
              : isObject(_dateTime) && "epochMilliseconds" in _dateTime
                ? new Date(Number(_dateTime.epochMilliseconds)).toISOString()
                : isNumber(_dateTime) || isBigInt(_dateTime)
                  ? new Date(Number(_dateTime)).toISOString()
                  : _dateTime
          )
      : undefined;

    super(instant ? Number(instant.epochMilliseconds) : "MISSING_DATE");
    if (instant && StormDateTime.validate(_dateTime, options) === null) {
      this.#instant = instant;

      this.#zonedDateTime = options?.calendar
        ? this.#instant.toZonedDateTime({
            timeZone: options.timeZone,
            calendar: options.calendar
          })
        : this.#instant.toZonedDateTimeISO(options.timeZone);
    }

    this.#input = input;
    this.#options = options;
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
   * An accessor that sets the `Temporal.Instant` object of the DateTime object
   */
  protected set instant(instant: Temporal.Instant) {
    this.#instant = instant;
  }

  /**
   * An accessor that returns the `Temporal.ZonedDateTime` object of the DateTime object
   */
  public get zonedDateTime(): Temporal.ZonedDateTime {
    return this.#zonedDateTime;
  }

  /**
   * An accessor that sets the `Temporal.ZonedDateTime` object of the DateTime object
   */
  protected set zonedDateTime(zonedDateTime: Temporal.ZonedDateTime) {
    this.#zonedDateTime = zonedDateTime;
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
    return this.#zonedDateTime.timeZoneId || StormDateTime.getDefaultTimeZone();
  }

  /**
   * An accessor that returns the `valid` boolean of the DateTime object
   */
  public get valid(): boolean {
    return this.validate() === null;
  }

  /**
   * An accessor that returns the `invalid` boolean of the DateTime object
   */
  public get invalid(): boolean {
    return !this.valid;
  }

  /**
   * Returns the input value used to create the DateTime object
   */
  public get input(): DateTimeInput {
    return this.#input;
  }

  /**
   * Returns the options used to create the DateTime object
   */
  public get options(): DateTimeOptions {
    return this.#options;
  }

  /**
   * A function that validates the current DateTime object
   *
   * @returns A StormError object if the DateTime object is invalid, otherwise null
   */
  public validate(): ValidationDetails | null {
    return StormDateTime.validate(
      this.#zonedDateTime.epochMilliseconds,
      this.#options
    );
  }

  /**
   * Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC.
   */
  public override getTime(): number {
    return this.epochMilliseconds;
  }

  /**
   *  Gets the year, using local time.
   */
  public override getFullYear(): number {
    return this.#zonedDateTime.year;
  }

  /**
   *  Gets the year using Universal Coordinated Time (UTC).
   */
  public override getUTCFullYear(): number {
    return this.#instant.toZonedDateTimeISO("UTC").year;
  }

  /**
   *  Gets the month, using local time.
   */
  public override getMonth(): number {
    return this.#zonedDateTime.month;
  }

  /**
   *  Gets the month of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCMonth(): number {
    return this.#instant.toZonedDateTimeISO("UTC").month;
  }

  /**
   *  Gets the day-of-the-month, using local time.
   */
  public override getDate(): number {
    return this.#zonedDateTime.day;
  }

  /**
   *  Gets the day-of-the-month, using Universal Coordinated Time (UTC).
   */
  public override getUTCDate(): number {
    return this.#instant.toZonedDateTimeISO("UTC").day;
  }

  /**
   *  Gets the day of the week, using local time.
   */
  public override getDay(): number {
    return this.#zonedDateTime.dayOfWeek;
  }

  /**
   *  Gets the day of the week using Universal Coordinated Time (UTC).
   */
  public override getUTCDay(): number {
    return this.#instant.toZonedDateTimeISO("UTC").dayOfWeek;
  }

  /**
   *  Gets the hours in a date, using local time.
   */
  public override getHours(): number {
    return this.#zonedDateTime.hour;
  }

  /**
   *  Gets the hours value in a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCHours(): number {
    return this.#instant.toZonedDateTimeISO("UTC").hour;
  }

  /**
   *  Gets the minutes of a Date object, using local time.
   */
  public override getMinutes(): number {
    return this.#zonedDateTime.minute;
  }

  /**
   *  Gets the minutes of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCMinutes(): number {
    return this.#instant.toZonedDateTimeISO("UTC").minute;
  }

  /**
   *  Gets the seconds of a Date object, using local time.
   */
  public override getSeconds(): number {
    return this.#zonedDateTime.second;
  }

  /**
   *  Gets the seconds of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCSeconds(): number {
    return this.#instant.toZonedDateTimeISO("UTC").second;
  }

  /**
   *  Gets the milliseconds of a Date, using local time.
   */
  public override getMilliseconds(): number {
    return this.#zonedDateTime.millisecond;
  }

  /**
   *  Gets the milliseconds of a Date object using Universal Coordinated Time (UTC).
   */
  public override getUTCMilliseconds(): number {
    return this.#instant.toZonedDateTimeISO("UTC").millisecond;
  }

  /**
   *  Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC).
   */
  public override getTimezoneOffset(): number {
    return this.#zonedDateTime.offsetNanoseconds / 1_000_000;
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
      .with({
        hour,
        minute,
        second,
        millisecond
      })
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
  public getPlainDate(): StormDateTime {
    return StormDateTime.create(
      this.#zonedDateTime.toPlainDate().toZonedDateTime({
        timeZone: StormDateTime.getDefaultTimeZone(),
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
  public getPlainTime(): StormDateTime {
    return StormDateTime.create(
      this.#zonedDateTime.toPlainTime().toZonedDateTime({
        timeZone: StormDateTime.getDefaultTimeZone(),
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
  public since(
    dateTimeTo: StormDateTime = StormDateTime.current()
  ): Temporal.Duration {
    return this.#instant.since(dateTimeTo.instant);
  }

  /**
   * It returns the duration between two date times.
   *
   * @param dateTimeTo - DateTime = DateTime.current
   * @returns A duration object.
   */
  public getDuration(
    dateTimeTo: StormDateTime = StormDateTime.current()
  ): Temporal.Duration {
    return this.instant.since(dateTimeTo.instant);
  }
}
