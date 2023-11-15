import { StormDateTime, formatDateTime } from "@storm-stack/date-time";
import { isStormError } from "@storm-stack/errors";
import { JsonParser } from "@storm-stack/serialization";
import {
  EMPTY_STRING,
  NEWLINE_STRING,
  isBaseType,
  isEmpty,
  isError,
  isObject,
  isProduction,
  isSetString,
  isString
} from "@storm-stack/utilities";

export type FormatLogOptions = {
  newLine?: boolean;
  newLineAfter?: boolean;
  prefix?: string;
  postfix?: string;
  stacktrace?: string | boolean;
  timestamp?: string | boolean;
};

/**
 * A function that takes a `message` of type `string`, a `newLine` of type `boolean` (defaults to `true`), a `newLineAfter` of type `boolean` (defaults to `true`), and an optional `prefix` of type `string`
 *
 * @param message - The message to print
 * @param newLine - Whether to print a new line before the message.
 * @param newLineAfter - Whether to print a new line after the message.
 * @param prefix - The prefix to use for the message.
 */
export const formatLogMessage = (
  message: unknown | unknown[],
  options: FormatLogOptions = {
    newLine: true,
    newLineAfter: true,
    stacktrace: false
  }
): string => {
  return `${options.newLine ? NEWLINE_STRING : ""}${
    (!isProduction() && options.timestamp !== false) || options.timestamp
      ? (isSetString(options.timestamp)
          ? options.timestamp
          : `Timestamp: ${formatLogTimestamp()}`) + NEWLINE_STRING
      : EMPTY_STRING
  }${options.prefix ? `${options.prefix} ` : EMPTY_STRING}${
    Array.isArray(message)
      ? message.reduce((ret, m, i) => {
          ret +=
            formatLogMessageLine(m) +
            (i < message.length - 1 ? NEWLINE_STRING : "");
          return ret;
        }, EMPTY_STRING)
      : formatLogMessageLine(message)
  }${options.postfix ? options.postfix : EMPTY_STRING}${
    options.stacktrace !== false &&
    (!isProduction() || (isSetString(options.stacktrace) && options.stacktrace))
      ? NEWLINE_STRING + options.stacktrace
      : EMPTY_STRING
  }${options.newLineAfter ? NEWLINE_STRING : EMPTY_STRING}`;
};

/**
 * A function that takes a `message` of type `string`, a `newLine` of type `boolean` (defaults to `true`), a `newLineAfter` of type `boolean` (defaults to `true`), and an optional `prefix` of type `string`
 *
 * @param message - string - The message to print
 * @param newLine - Whether to print a new line before the message.
 * @param newLineAfter - Whether to print a new line after the message.
 * @param prefix - The prefix to use for the message.
 */
export const formatLogMessageLine = (message: unknown): string =>
  Array.isArray(message)
    ? message.reduce((ret, m, i) => {
        ret +=
          formatLogMessageLine(m) +
          (i < message.length - 1 ? ", " : EMPTY_STRING);
        return ret;
      }, "")
    : isEmpty(message)
      ? "<Empty>"
      : !isBaseType(message) && !isObject(message) && !isError(message)
        ? JsonParser.stringify(message)
        : isError(message)
          ? (message as Error)?.name && (message as Error)?.message
            ? `${(message as Error)?.name}: ${(message as Error)?.message}`
            : (message as Error)?.name
              ? (message as Error)?.name
              : (message as Error)?.message
                ? (message as Error)?.message
                : "<Error>"
          : !isString(message)
            ? JsonParser.stringify(message)
            : (message as string);

/**
 * A function that takes a `message` of type `string`, a `newLine` of type `boolean` (defaults to `true`), a `newLineAfter` of type `boolean` (defaults to `true`), and an optional `prefix` of type `string`
 *
 * @param message - The message to print
 * @param newLine - Whether to print a new line before the message.
 * @param newLineAfter - Whether to print a new line after the message.
 * @param prefix - The prefix to use for the message.
 */
export const formatLogError = (
  error: Error,
  newLine = true,
  newLineAfter = true,
  prefix?: string,
  postfix?: string
): string => {
  return formatLogMessage(
    isStormError(error) ? error.display : `${error.name}: ${error.message}`,
    {
      newLine,
      newLineAfter,
      prefix,
      postfix,
      stacktrace: error.stack ?? true
    }
  );
};

/**
 * Format a timestamp
 *
 * @param dateTime - The date time to format
 * @returns The formatted timestamp string
 */
export const formatLogTimestamp = (
  dateTime: StormDateTime = StormDateTime.current()
): string => {
  return formatDateTime(
    dateTime,
    { smallestUnit: "milliseconds", calendarName: "never" },
    "UTC"
  );
};

/*export const formatStacktrace = (
              stackTrace?: string | boolean,
              error?: Error
            ): string => {
              const stack =
                stackTrace === false
                  ? EMPTY_STRING
                  : isString(stackTrace) && stackTrace
                    ? stackTrace
                    : isError(error) && (error as Error)?.stack
                      ? (error as Error)?.stack
                      : new Error().stack?.substring(6)
                        ? new Error().stack?.substring(6)
                        : EMPTY_STRING;

              return stack
                ? `
            Stack Trace: ${stack}`
                : EMPTY_STRING;
            };*/
