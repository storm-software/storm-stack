import pino from "pino";
import { getOptions } from "./get-options";
import { IStormLog } from "./types";

/**
 * The default logger class.
 *
 * @remarks
 * This logger writes to the console.
 */
export class StormLog implements IStormLog {
  private static consoleLogs: pino.BaseLogger;
  private static fileLogs: pino.BaseLogger | undefined;

  private static getLogger = async (
    projectName?: string
  ): Promise<{
    file: pino.BaseLogger | undefined;
    console: pino.BaseLogger;
  }> => {
    if (!this.consoleLogs) {
      const options = await getOptions(projectName);
      if (options.console?.options) {
        this.consoleLogs = pino(options.console.options);
      }
      if (options.file?.options) {
        this.fileLogs = options.file.stream
          ? pino(options.file.options, options.file.stream)
          : pino(options.file.options);
      }

      this.consoleLogs.debug("The Storm log has ben initialized");
    }

    return { file: this.fileLogs, console: this.consoleLogs };
  };

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public static success(...message: any[]) {
    this.getLogger().then(logger => {
      logger.console.info({ msg: message, level: "success" });
    });
    // writeSuccess(message, true, true, false);
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static fatal(error: string | Error) {
    this.getLogger().then(logger => {
      logger.console.fatal({ error, level: "fatal" });
    });
    // writeError(message, true, true, true, "FATAL");
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static error(error: string | Error) {
    this.getLogger().then(logger => {
      logger.console.error({ error, level: "error" });
    });
    // writeError(message, true, true);
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static exception(error: string | Error) {
    this.getLogger().then(logger => {
      logger.console.error({ error, level: "exception" });
    });
    // writeError(message, true, true);
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static warn(...message: any[]) {
    this.getLogger().then(logger => {
      logger.console.warn(message);
    });
    // writeWarning(message, true, true, false);
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static info(...message: any[]) {
    this.getLogger().then(logger => {
      logger.console.info(message);
    });
    // writeInfo(message, true, true, false, "INFO");
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static debug(...message: any[]) {
    this.getLogger().then(logger => {
      logger.console.debug(message);
    });
    // writeInfo(message, true, true, false, "DEBUG");
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static trace(...message: any[]) {
    this.getLogger().then(logger => {
      logger.console.trace(message);
    });
    // writeInfo(message, true, true, false, "TRACE");
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static log(...message: any[]) {
    this.getLogger().then(logger => {
      logger.console.info(message);
    });
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public success(...message: any[]) {
    StormLog.success(message);
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public fatal(message: string | Error) {
    StormLog.fatal(message);
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public error(message: string | Error) {
    StormLog.error(message);
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public exception(message: string | Error) {
    StormLog.exception(message);
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public warn(...message: any[]) {
    StormLog.warn(message);
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public info(...message: any[]) {
    StormLog.info(message);
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public debug(...message: any[]) {
    StormLog.debug(message);
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public trace(...message: any[]) {
    StormLog.trace(message);
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public log(...message: any[]) {
    StormLog.log(message);
  }
}
