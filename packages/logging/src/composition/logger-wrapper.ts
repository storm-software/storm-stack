import { getCauseFromUnknown } from "@storm-stack/errors";
import { type MaybePromise, isSet, isSetString } from "@storm-stack/utilities";
import type { ILogger, ILoggerWrapper, LoggingConfig } from "../types";

/**
 * A wrapper for a logger class.
 */
export class LoggerWrapper implements ILoggerWrapper {
  /**
   * Wrap a logger.
   *
   * @param logger - The logger to wrap.
   * @param config - The logging configuration.
   * @param name - The logger's name.
   * @returns The wrapped logger.
   */
  public static wrap = (logger: ILogger, config: LoggingConfig, name?: string): LoggerWrapper => {
    return new LoggerWrapper(logger, config, name);
  };

  #logger: ILogger;

  private constructor(
    logger: ILogger,
    protected config: LoggingConfig,
    protected name?: string
  ) {
    this.#logger = logger;
    this.config = config ?? { stacktrace: true };
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public success = (message: string): MaybePromise<void> => {
    return isSet(this.#logger.success) ? this.#logger.success(message) : this.info(message);
  };

  /**
   * Write a fatal message to the logs.
   *
   * @param error - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public fatal = (error: string | Error): MaybePromise<void> => {
    const message = this.getErrorMessage(error);

    return isSet(this.#logger.fatal) ? this.#logger.fatal(message) : this.error(message);
  };

  /**
   * Write an error message to the logs.
   *
   * @param error - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public exception = (error: string | Error): MaybePromise<void> => {
    const message = this.getErrorMessage(error);

    return isSet(this.#logger.exception) ? this.#logger.exception(message) : this.error(message);
  };

  /**
   * Write an error message to the logs.
   *
   * @param error - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public error = (error: string | Error): MaybePromise<void> => {
    return this.#logger.error(this.getErrorMessage(error));
  };

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public warn = (message: string): MaybePromise<void> => {
    return this.#logger.warn(message);
  };

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public info = (message: string): MaybePromise<void> => {
    return this.#logger.info(message);
  };

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public debug = (message: string): MaybePromise<void> => {
    return isSet(this.#logger.debug)
      ? this.#logger.debug(message)
      : isSet(this.#logger.trace)
        ? this.#logger.trace(message)
        : this.info(message);
  };

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public trace = (message: string): MaybePromise<void> => {
    return isSet(this.#logger.trace)
      ? this.#logger.trace(message)
      : isSet(this.#logger.debug)
        ? this.#logger.debug(message)
        : this.info(message);
  };

  /**
   * Write a log message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public log = (message: string): MaybePromise<void> => {
    return isSet(this.#logger.log) ? this.#logger.log(message) : this.info(message);
  };

  /**
   * Format an error message.
   *
   * @param obj - The error to format.
   * @returns The formatted error message.
   */
  protected getErrorMessage = (obj?: string | Error | null): string => {
    if (isSetString(obj)) {
      return obj;
    }

    const error = getCauseFromUnknown(obj);

    let message = error.print();
    if (this.config.stacktrace && isSet(error.stack)) {
      message += `\n${error.stack}`;
    }

    return message;
  };
}
