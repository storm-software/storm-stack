## API Report File for "@storm-stack/date-time"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { Temporal } from "@js-temporal/polyfill";

// @public (undocumented)
type DateTimeErrorCode =
  | ErrorCode
  | "datetime_create_failure"
  | "ms_format"
  | "formatting_failure";

// @public (undocumented)
const DateTimeErrorCode: {
  datetime_create_failure: DateTimeErrorCode;
  ms_format: DateTimeErrorCode;
  formatting_failure: DateTimeErrorCode;
  success: ErrorCode;
  missing_issue_code: ErrorCode;
  invalid_config: ErrorCode;
  failed_to_load_file: ErrorCode;
  missing_context: ErrorCode;
  record_not_found: ErrorCode;
  required_field_missing: ErrorCode;
  database_query_error: ErrorCode;
  model_validation_error: ErrorCode;
  field_validation_error: ErrorCode;
  invalid_parameter: ErrorCode;
  invalid_request: ErrorCode;
  type_error: ErrorCode;
  processing_error: ErrorCode;
  internal_server_error: ErrorCode;
  user_not_logged_in: ErrorCode;
  unknown_cause: ErrorCode;
};
export { DateTimeErrorCode };
export { DateTimeErrorCode as DateTimeErrorCode_alias_1 };

// @public
type DateTimeInput =
  | StormDateTime
  | Temporal.Instant
  | Date
  | string
  | number
  | bigint
  | null
  | undefined;
export { DateTimeInput };
export { DateTimeInput as DateTimeInput_alias_1 };

// @public
interface DateTimeOptions {
  calendar?: Temporal.CalendarLike;
  skipDefaulting?: boolean;
  timeZone?: Temporal.TimeZoneLike;
}
export { DateTimeOptions };
export { DateTimeOptions as DateTimeOptions_alias_1 };

// @public
function deserializeStormDate(utcString: JsonValue): StormDate;
export { deserializeStormDate };
export { deserializeStormDate as deserializeStormDate_alias_1 };
export { deserializeStormDate as deserializeStormDate_alias_2 };

// @public
function deserializeStormDateTime(utcString: JsonValue): StormDateTime;
export { deserializeStormDateTime };
export { deserializeStormDateTime as deserializeStormDateTime_alias_1 };
export { deserializeStormDateTime as deserializeStormDateTime_alias_2 };

// @public
function deserializeStormTime(utcString: JsonValue): StormTime;
export { deserializeStormTime };
export { deserializeStormTime as deserializeStormTime_alias_1 };
export { deserializeStormTime as deserializeStormTime_alias_2 };

// @public
const formatDate: (
  dateTime?: StormDateTime,
  options?: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  >
) => string;
export { formatDate };
export { formatDate as formatDate_alias_1 };
export { formatDate as formatDate_alias_2 };

// @public
const formatDateTime: (
  dateTime?: StormDateTime,
  options?: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  >
) => string;
export { formatDateTime };
export { formatDateTime as formatDateTime_alias_1 };
export { formatDateTime as formatDateTime_alias_2 };

// @public
const formatDateTimeISO: (
  dateTime?: StormDateTime | null,
  options?: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  >
) => string;
export { formatDateTimeISO };
export { formatDateTimeISO as formatDateTimeISO_alias_1 };
export { formatDateTimeISO as formatDateTimeISO_alias_2 };

// @public
const formatSince: (
  dateTimeOrDuration: StormDateTime | Temporal.Duration,
  dateTimeTo?: StormDateTime,
  options?: FormatSinceOptions
) => string;
export { formatSince };
export { formatSince as formatSince_alias_1 };
export { formatSince as formatSince_alias_2 };

// @public
type FormatSinceOptions = {
  colonNotation?: boolean;
  compact?: boolean;
  formatSubMilliseconds?: boolean;
  keepDecimalsOnWholeSeconds?: boolean;
  millisecondsDecimalDigits?: number;
  secondsDecimalDigits?: number;
  separateMilliseconds?: boolean;
  unitCount?: number;
  verbose?: boolean;
};
export { FormatSinceOptions };
export { FormatSinceOptions as FormatSinceOptions_alias_1 };
export { FormatSinceOptions as FormatSinceOptions_alias_2 };

// @public
const formatTime: (
  dateTime?: StormDateTime,
  options?: Partial<
    Temporal.ToStringPrecisionOptions & Temporal.ShowCalendarOption
  >
) => string;
export { formatTime };
export { formatTime as formatTime_alias_1 };
export { formatTime as formatTime_alias_2 };

// @public
function isDateTime(obj: unknown): obj is StormDateTime;
export { isDateTime };
export { isDateTime as isDateTime_alias_1 };
export { isDateTime as isDateTime_alias_2 };

// @public
function isInstant(value: unknown): value is Temporal.Instant;
export { isInstant };
export { isInstant as isInstant_alias_1 };
export { isInstant as isInstant_alias_2 };

// @public (undocumented)
const RFC_3339_DATE_REGEX: RegExp;
export { RFC_3339_DATE_REGEX };
export { RFC_3339_DATE_REGEX as RFC_3339_DATE_REGEX_alias_1 };

// @public (undocumented)
const RFC_3339_DATETIME_REGEX: RegExp;
export { RFC_3339_DATETIME_REGEX };
export { RFC_3339_DATETIME_REGEX as RFC_3339_DATETIME_REGEX_alias_1 };

// @public (undocumented)
const RFC_3339_TIME_REGEX: RegExp;
export { RFC_3339_TIME_REGEX };
export { RFC_3339_TIME_REGEX as RFC_3339_TIME_REGEX_alias_1 };

// @public
function serializeStormDate(date: StormDate): string;
export { serializeStormDate };
export { serializeStormDate as serializeStormDate_alias_1 };
export { serializeStormDate as serializeStormDate_alias_2 };

// @public
function serializeStormDateTime(dateTime: StormDateTime): string;
export { serializeStormDateTime };
export { serializeStormDateTime as serializeStormDateTime_alias_1 };
export { serializeStormDateTime as serializeStormDateTime_alias_2 };

// @public
function serializeStormTime(date: StormTime): string;
export { serializeStormTime };
export { serializeStormTime as serializeStormTime_alias_1 };
export { serializeStormTime as serializeStormTime_alias_2 };

// @public
class StormDate extends StormDateTime {
  constructor(dateTime?: DateTimeInput, options?: DateTimeOptions);
  static create: (date?: DateTimeInput, options?: DateTimeOptions) => StormDate;
  static current(): StormDate;
  getDuration(dateTimeTo?: StormDateTime): Temporal.Duration;
  getHours(): number;
  getMilliseconds(): number;
  getMinutes(): number;
  getSeconds(): number;
  getTimezoneOffset(): number;
  getUTCHours(): number;
  getUTCMilliseconds(): number;
  getUTCMinutes(): number;
  getUTCSeconds(): number;
  static now(): number;
  protected validate(
    dateTime?: DateTimeInput,
    options?: DateTimeOptions
  ): boolean;
}
export { StormDate };
export { StormDate as StormDate_alias_1 };

// @public
class StormDateTime extends Date {
  constructor(dateTime?: DateTimeInput, options?: DateTimeOptions);
  get calendarId(): string;
  static create: (
    dateTime?: DateTimeInput,
    options?: DateTimeOptions
  ) => StormDateTime;
  static current(): StormDateTime;
  get epochMilliseconds(): number;
  getDate(): number;
  getDay(): number;
  getDuration(dateTimeTo?: StormDateTime): Temporal.Duration;
  getFullYear(): number;
  getHours(): number;
  getMilliseconds(): number;
  getMinutes(): number;
  getMonth(): number;
  getPlainDate(): StormDateTime;
  getPlainTime(): StormDateTime;
  getSeconds(): number;
  getTime(): number;
  getTimezoneOffset(): number;
  getUTCDate(): number;
  getUTCDay(): number;
  getUTCFullYear(): number;
  getUTCHours(): number;
  getUTCMilliseconds(): number;
  getUTCMinutes(): number;
  getUTCMonth(): number;
  getUTCSeconds(): number;
  get input(): DateTimeInput;
  get instant(): Temporal.Instant;
  protected set instant(_instant: Temporal.Instant);
  get isValid(): boolean;
  static now(): number;
  get options(): DateTimeOptions;
  setDate(day: number): number;
  setFullYear(year: number, month?: number, day?: number): number;
  setHours(
    hour: number,
    minute: number,
    second?: number,
    millisecond?: number
  ): number;
  setMilliseconds(millisecond: number): number;
  setMinutes(minute: number, second?: number, millisecond?: number): number;
  setMonth(month: number, day?: number): number;
  setSeconds(second: number, millisecond?: number): number;
  setTime(time: number): number;
  setUTCDate(day: number): number;
  setUTCFullYear(year: number, month?: number, day?: number): number;
  setUTCHours(
    hour: number,
    minute: number,
    second?: number,
    millisecond?: number
  ): number;
  setUTCMilliseconds(millisecond: number): number;
  setUTCMinutes(minute: number, second?: number, millisecond?: number): number;
  setUTCMonth(month: number, day?: number): number;
  setUTCSeconds(second: number, millisecond?: number): number;
  since(dateTimeTo?: StormDateTime): Temporal.Duration;
  get timeZoneId(): string;
  protected validate(
    dateTime?: DateTimeInput,
    options?: DateTimeOptions
  ): boolean;
  get zonedDateTime(): Temporal.ZonedDateTime;
  protected set zonedDateTime(_zonedDateTime: Temporal.ZonedDateTime);
}
export { StormDateTime };
export { StormDateTime as StormDateTime_alias_1 };

// @public
class StormTime extends StormDateTime {
  constructor(dateTime?: DateTimeInput, options?: DateTimeOptions);
  static create: (time?: DateTimeInput, options?: DateTimeOptions) => StormTime;
  static current(): StormTime;
  getDate(): number;
  getDay(): number;
  getDuration(dateTimeTo?: StormTime): Temporal.Duration;
  getFullYear(): number;
  getMonth(): number;
  getUTCDate(): number;
  getUTCDay(): number;
  getUTCFullYear(): number;
  getUTCMonth(): number;
  static now(): number;
  protected validate(
    dateTime?: DateTimeInput,
    options?: DateTimeOptions
  ): boolean;
}
export { StormTime };
export { StormTime as StormTime_alias_1 };

// @public (undocumented)
function validateDate(value: DateTimeInput, options?: DateTimeOptions): boolean;
export { validateDate };
export { validateDate as validateDate_alias_1 };
export { validateDate as validateDate_alias_2 };

// @public
function validateDateTime(
  value: DateTimeInput,
  options?: DateTimeOptions
): boolean;
export { validateDateTime };
export { validateDateTime as validateDateTime_alias_1 };
export { validateDateTime as validateDateTime_alias_2 };

// @public (undocumented)
function validateTime(
  value?: DateTimeInput,
  options?: DateTimeOptions
): boolean;
export { validateTime };
export { validateTime as validateTime_alias_1 };
export { validateTime as validateTime_alias_2 };

// (No @packageDocumentation comment for this package)
```