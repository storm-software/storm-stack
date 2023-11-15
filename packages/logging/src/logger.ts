import { ILogger } from "./types";
import {
  writeError,
  writeInfo,
  writeSuccess,
  writeWarning
} from "./write-console";

/**
 * The default logger.
 *
 * @remarks
 * This logger writes to the console.
 */
export const logger: ILogger = {
  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  success(...message: any[]) {
    writeSuccess(message, true, true, false);
  },

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  fatal(message: string | Error) {
    writeError(message, true, true, true, "FATAL");
  },

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  error(message: string | Error) {
    writeError(message, true, true);
  },

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  exception(message: string | Error) {
    writeError(message, true, true);
  },

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  warn(...message: any[]) {
    writeWarning(message, true, true, false);
  },

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  info(...message: any[]) {
    writeInfo(message, true, true, false, "INFO");
  },

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  debug(...message: any[]) {
    writeInfo(message, true, true, false, "DEBUG");
  },

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  trace(...message: any[]) {
    writeInfo(message, true, true, false, "TRACE");
  },

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  log(...message: any[]) {
    writeInfo(message, true, true, false, "INFO");
  }
};
