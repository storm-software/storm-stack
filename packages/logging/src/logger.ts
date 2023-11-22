import {
  getConfigModule,
  getStormConfig
} from "@storm-software/config/get-config";
import { StormConfig } from "@storm-software/config/types";
import pino from "pino";
import { getOptions } from "./get-options";
import { LoggingConfigSchema } from "./schema";
import { IStormLog, LoggingConfig } from "./types";

/**
 * The default logger class.
 *
 * @remarks
 * This logger writes to the console.
 */
export class StormLog implements IStormLog {
  private static console: pino.BaseLogger;
  private static file: pino.BaseLogger | undefined;

  private static getLogger = async (): Promise<{
    file: pino.BaseLogger | undefined;
    console: pino.BaseLogger;
  }> => {
    if (!StormLog.console) {
      let workspaceConfig = await getStormConfig();
      const loggingConfig =
        (await getConfigModule<LoggingConfig>(
          LoggingConfigSchema,
          "logging"
        )) ?? {};

      const result = await StormLog.initialize({
        ...workspaceConfig,
        modules: {
          ...workspaceConfig.modules,
          logging: loggingConfig
        }
      });

      StormLog.console = result.console;
      StormLog.file = result.file;
    }

    return { console: StormLog.console, file: StormLog.file };
  };

  /**
   * Initialize the logger.
   *
   * @param config - The Storm config
   * @param projectName - The name of the project to initialized the loggers for
   * @returns The initialized loggers
   */
  private static initialize = (
    config: StormConfig,
    projectName?: string
  ): {
    file: pino.BaseLogger | undefined;
    console: pino.BaseLogger;
  } => {
    let consoleLogs!: pino.BaseLogger;
    let fileLogs!: pino.BaseLogger;

    const options = getOptions(
      config,
      projectName && config.projects[projectName]
        ? config.projects[projectName]?.modules.logging
        : config.modules.logging,
      projectName
    );
    if (options.console?.options) {
      consoleLogs = pino(options.console.options);
    }
    if (options.file?.options) {
      fileLogs = options.file.stream
        ? pino(options.file.options, options.file.stream)
        : pino(options.file.options);
    }

    consoleLogs.debug("The Storm log has ben initialized");

    return { file: fileLogs, console: consoleLogs };
  };

  private console: pino.BaseLogger;
  private file: pino.BaseLogger | undefined;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(
    private config: StormConfig,
    private projectName?: string
  ) {
    const logger = StormLog.initialize(config, projectName);

    this.console = logger.console;
    this.file = logger.file;
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public static success(...message: any[]) {
    this.getLogger().then(logger => {
      logger.console.info({ msg: message, level: "success" });
      logger.file && logger.file.info({ msg: message, level: "success" });
    });
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
      logger.file && logger.file.fatal({ error, level: "fatal" });
    });
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
      logger.file && logger.file.error({ error, level: "error" });
    });
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
      logger.file && logger.file.error({ error, level: "exception" });
    });
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
      logger.file && logger.file.warn(message);
    });
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
      logger.file && logger.file.info(message);
    });
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
      logger.file && logger.file.debug(message);
    });
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
      logger.file && logger.file.trace(message);
    });
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
      logger.file && logger.file.info(message);
    });
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public success(...message: any[]) {
    this.console.info({ msg: message, level: "success" });
    this.file && this.file.info({ msg: message, level: "success" });
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public fatal(error: string | Error) {
    this.console.fatal({ error, level: "fatal" });
    this.file && this.file.fatal({ error, level: "fatal" });
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public error(error: string | Error) {
    this.console.error({ error, level: "error" });
    this.file && this.file.error({ error, level: "error" });
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public exception(error: string | Error) {
    this.console.error({ error, level: "exception" });
    this.file && this.file.error({ error, level: "exception" });
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public warn(...message: any[]) {
    this.console.warn(message);
    this.file && this.file.warn(message);
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public info(...message: any[]) {
    this.console.info(message);
    this.file && this.file.info(message);
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public debug(...message: any[]) {
    this.console.debug(message);
    this.file && this.file.debug(message);
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public trace(...message: any[]) {
    this.console.trace(message);
    this.file && this.file.trace(message);
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public log(...message: any[]) {
    this.console.info(message);
    this.file && this.file.info(message);
  }
}
