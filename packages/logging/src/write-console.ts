import {
  getErrorColor,
  getInfoColor,
  getSuccessColor,
  getWarningColor,
  isString
} from "@storm-stack/utilities";
import chalk from "chalk";
import { formatLogMessage, formatLogTimestamp } from "./format";

/**
 * Write an informational message to the console.
 *
 * @param message - The message to write
 * @param newLine - If true, the message will be written on a new line.
 * @param newLineAfter - If true, a new line will be written after the message.
 */
export const writeInfo = (
  message: unknown[],
  newLine: boolean | undefined = true,
  newLineAfter: boolean | undefined = true,
  stacktrace: boolean | undefined = false,
  prefix = "INFO"
) => {
  console.info(
    formatLogMessage(message, {
      newLine,
      newLineAfter,
      prefix: chalk.bold(
        "> " +
          chalk.bgHex(getInfoColor()).whiteBright(" i ") +
          chalk.hex(getInfoColor())(` ${prefix} `) +
          "-"
      ),
      stacktrace:
        isString(stacktrace) && stacktrace ? chalk.dim(stacktrace) : stacktrace,
      timestamp: chalk.dim(`Timestamp: ${formatLogTimestamp()}`)
    })
  );
};

/**
 * Write a success message to the console.
 *
 * @param message - The message to write
 * @param newLine - whether to write a new line before the message
 * @param newLineAfter - whether to write a new line after the message
 */
export const writeSuccess = (
  message: unknown[],
  newLine: boolean | undefined = true,
  newLineAfter: boolean | undefined = true,
  stacktrace: boolean | undefined = false,
  prefix = "SUCCESS"
) => {
  console.info(
    formatLogMessage(message, {
      newLine,
      newLineAfter,
      prefix: chalk.bold(
        "> " + chalk.hex(getSuccessColor())(` ${prefix} ✓ `) + "-"
      ),
      stacktrace:
        isString(stacktrace) && stacktrace ? chalk.dim(stacktrace) : stacktrace,
      timestamp: chalk.dim(`Timestamp: ${formatLogTimestamp()}`)
    })
  );
};

/**
 * Write a warning message to the console.
 *
 * @param message - The message to write
 * @param newLine - whether to write a new line before the message
 * @param newLineAfter - whether to write a new line after the message
 */
export const writeWarning = (
  message: unknown[],
  newLine: boolean | undefined = true,
  newLineAfter: boolean | undefined = true,
  stacktrace: boolean | undefined = true,
  prefix = "WARNING"
) => {
  console.warn(
    formatLogMessage(message, {
      newLine,
      newLineAfter,
      prefix: chalk.bold(
        "> " +
          chalk.bgHex(getWarningColor()).blackBright(" ▲ ") +
          chalk.hex(getWarningColor())(` ${prefix} `) +
          "-"
      ),
      stacktrace:
        isString(stacktrace) && stacktrace ? chalk.dim(stacktrace) : stacktrace,
      timestamp: chalk.dim(`Timestamp: ${formatLogTimestamp()}`)
    })
  );
};

/**
 * Write an error message to the console.
 *
 * @param message - The message to write
 * @param newLine - whether to write a new line before the message
 * @param newLineAfter - whether to write a new line after the message
 */
export const writeError = (
  message: Error | string,
  newLine: boolean | undefined = true,
  newLineAfter: boolean | undefined = true,
  stacktrace: boolean | undefined = true,
  prefix = "ERROR"
) => {
  const error = message as Error;

  console.error(message);
  console.error(
    formatLogMessage(error?.message ? error.message : message, {
      newLine,
      newLineAfter,
      prefix: chalk.bold(
        `> ${chalk.bgHex(getErrorColor()).whiteBright(" ! ")} ${chalk.hex(
          getErrorColor()
        )(`${prefix} ${chalk.italic(error?.name ? `(${error.name}) ` : "")}`)}-`
      ),
      stacktrace: chalk.dim(stacktrace ? stacktrace : error.stack),
      timestamp: chalk.dim(`Timestamp: ${formatLogTimestamp()}`)
    })
  );
};

/**
 * A function that starts a console group
 *
 * @param group - string
 */
export const writeGroupStart = (group: string) => {
  console.group(group);
};

/**
 * A function that ends a console group
 *
 * @param group - string
 */
export const writeGroupEnd = () => {
  console.groupEnd();
};
