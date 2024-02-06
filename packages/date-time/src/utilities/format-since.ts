import type { Temporal } from "@js-temporal/polyfill";
import { StormError } from "@storm-stack/errors";
import { DateTimeErrorCode } from "../errors";
import { StormDateTime } from "../storm-date-time";
import { isDateTime } from "./is-date-time";

const pluralize = (word: string, count: number) => (count === 1 ? word : `${word}s`);
const SECOND_ROUNDING_EPSILON = 0.000_000_1;

const parseMilliseconds = (milliseconds: number) => {
  if (!Number.isFinite(milliseconds)) {
    throw new StormError(DateTimeErrorCode.ms_format, {
      message: "Method `parseMilliseconds` expected a finite number"
    });
  }

  return {
    days: Math.trunc(milliseconds / 86400000),
    hours: Math.trunc(milliseconds / 3600000) % 24,
    minutes: Math.trunc(milliseconds / 60000) % 60,
    seconds: Math.trunc(milliseconds / 1000) % 60,
    milliseconds: Math.trunc(milliseconds) % 1000,
    microseconds: Math.trunc(milliseconds * 1000) % 1000,
    nanoseconds: Math.trunc(milliseconds * 1e6) % 1000
  };
};

/**
 * Options for the `formatSince` method
 */
export type FormatSinceOptions = {
  /**
   * Whether to use colon notation
   */
  colonNotation?: boolean;

  /**
   * Whether to use compact notation
   */
  compact?: boolean;

  /**
   * Whether to format sub-milliseconds
   */
  formatSubMilliseconds?: boolean;

  /**
   * Whether to keep decimals on whole seconds
   */
  keepDecimalsOnWholeSeconds?: boolean;

  /**
   * The number of decimal digits to use for milliseconds
   */
  millisecondsDecimalDigits?: number;

  /**
   * The number of decimal digits to use for seconds
   */
  secondsDecimalDigits?: number;

  /**
   * Whether to separate milliseconds
   */
  separateMilliseconds?: boolean;

  /**
   * The number of units to include
   */
  unitCount?: number;

  /**
   * Whether to use verbose notation
   */
  verbose?: boolean;
};

/**
 * Formats a duration or a date-time since another date-time.
 *
 * @remarks
 * An example output when the options.verbose is true:
 * 4 days 3 hours 2 minutes 1 second 0 milliseconds
 *
 * An example output when the options.verbose is false:
 * 4d 3h 2m 1s 0ms
 *
 * @param dateTimeOrDuration - The date-time or duration to format
 * @param dateTimeTo - The date-time to format since
 * @param options - The options to use
 * @returns The formatted time since
 */
export const formatSince = (
  dateTimeOrDuration: StormDateTime | Temporal.Duration,
  dateTimeTo: StormDateTime = StormDateTime.current(),
  options: FormatSinceOptions = {
    colonNotation: false,
    compact: false,
    formatSubMilliseconds: false,
    keepDecimalsOnWholeSeconds: false,
    millisecondsDecimalDigits: 0,
    secondsDecimalDigits: 1,
    separateMilliseconds: false,
    unitCount: 0,
    verbose: false
  }
): string => {
  let milliseconds!: number;
  if (isDateTime(dateTimeOrDuration)) {
    milliseconds = dateTimeTo.since(dateTimeOrDuration).milliseconds;
  } else {
    milliseconds = dateTimeOrDuration.milliseconds;
  }

  if (!Number.isFinite(milliseconds)) {
    throw new StormError(DateTimeErrorCode.ms_format, {
      message: "Method `formatSince` expected a finite number"
    });
  }

  // Adjust the milliseconds to be positive
  if (milliseconds < 0) {
    milliseconds *= -1;
  }

  if (options.colonNotation) {
    options.compact = false;
    options.formatSubMilliseconds = false;
    options.separateMilliseconds = false;
    options.verbose = false;
  }

  if (options.compact) {
    options.secondsDecimalDigits = 0;
    options.millisecondsDecimalDigits = 0;
  }

  const result: string[] = [];
  const floorDecimals = (value: number, decimalDigits: number) => {
    const flooredInterimValue = Math.floor(value * 10 ** decimalDigits + SECOND_ROUNDING_EPSILON);
    const flooredValue = Math.round(flooredInterimValue) / 10 ** decimalDigits;
    return flooredValue.toFixed(decimalDigits);
  };

  const add = (value: number, long: string, short: string, valueString?: string) => {
    if (
      (result.length === 0 || !options.colonNotation) &&
      value === 0 &&
      !(options.colonNotation && short === "m")
    ) {
      return;
    }

    let _valueString = (valueString || value || "0").toString();
    let prefix: string;
    let suffix: string;
    if (options.colonNotation) {
      prefix = result.length > 0 ? ":" : "";
      suffix = "";
      const wholeDigits = _valueString.includes(".")
        ? _valueString.split(".")[0]?.length ?? 0
        : _valueString.length;
      const minLength = result.length > 0 ? 2 : 1;
      _valueString = "0".repeat(Math.max(0, minLength - wholeDigits)) + _valueString;
    } else {
      prefix = "";
      suffix = options.verbose ? ` ${pluralize(long, value)}` : short;
    }

    result.push(prefix + _valueString + suffix);
  };

  const parsed = parseMilliseconds(milliseconds);

  add(Math.trunc(parsed.days / 365), "year", "y");
  add(parsed.days % 365, "day", "d");
  add(parsed.hours, "hour", "h");
  add(parsed.minutes, "minute", "m");

  if (
    options.separateMilliseconds ||
    options.formatSubMilliseconds ||
    (!options.colonNotation && milliseconds < 1000)
  ) {
    add(parsed.seconds, "second", "s");
    if (options.formatSubMilliseconds) {
      add(parsed.milliseconds, "millisecond", "ms");
      add(parsed.microseconds, "microsecond", "µs");
      add(parsed.nanoseconds, "nanosecond", "ns");
    } else {
      const millisecondsAndBelow =
        parsed.milliseconds + parsed.microseconds / 1000 + parsed.nanoseconds / 1e6;

      const millisecondsDecimalDigits =
        typeof options.millisecondsDecimalDigits === "number"
          ? options.millisecondsDecimalDigits
          : 0;

      const roundedMilliseconds =
        millisecondsAndBelow >= 1
          ? Math.round(millisecondsAndBelow)
          : Math.ceil(millisecondsAndBelow);

      const millisecondsString = millisecondsDecimalDigits
        ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits)
        : String(roundedMilliseconds);

      add(Number.parseFloat(millisecondsString), "millisecond", "ms", millisecondsString);
    }
  } else {
    const seconds = (milliseconds / 1000) % 60;
    const secondsDecimalDigits =
      typeof options.secondsDecimalDigits === "number" ? options.secondsDecimalDigits : 1;
    const secondsFixed = floorDecimals(seconds, secondsDecimalDigits);
    const secondsString = options.keepDecimalsOnWholeSeconds
      ? secondsFixed
      : secondsFixed.replace(/\.0+$/, "");
    add(Number.parseFloat(secondsString), "second", "s", secondsString);
  }

  if (result.length === 0) {
    return `0${options.verbose ? " milliseconds" : "ms"}`;
  }

  if (options.compact) {
    if (!result[0]) {
      throw new StormError(DateTimeErrorCode.formatting_failure, {
        message: "Unexpected empty result"
      });
    }

    return result[0];
  }

  if (typeof options.unitCount === "number") {
    const separator = options.colonNotation ? "" : " ";
    return result.slice(0, Math.max(options.unitCount, 1)).join(separator);
  }

  return options.colonNotation ? result.join("") : result.join(" ");
};
