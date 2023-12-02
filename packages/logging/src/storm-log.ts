import { getStormConfig } from "@storm-software/config/get-config";
import { StormConfig } from "@storm-software/config/types";
import { StormTime, formatSince } from "@storm-software/date-time";
import { getCauseFromUnknown } from "@storm-software/errors";
import pino from "pino";
import { LoggerWrapper } from "./composition/logger-wrapper";
import { ILogger, ILoggerWrapper, IStormLog, LoggingConfig } from "./types";
import { getTransports } from "./utilities/get-transports";

/**
 * The default logger class.
 *
 * @remarks
 * This logger writes to the console.
 */
export class StormLog implements IStormLog {
  private static baseLogger: pino.BaseLogger;

  private static getLoggers = async (): Promise<pino.BaseLogger> => {
    if (!StormLog.baseLogger) {
      let config = await getStormConfig();
      StormLog.baseLogger = StormLog.initialize(
        config as StormConfig<"logging", LoggingConfig>
      );
    }

    return StormLog.baseLogger;
  };

  /**
   * Initialize the logger.
   *
   * @param config - The Storm config
   * @param name - The name of the project to initialized the loggers for
   * @returns The initialized loggers
   */
  private static initialize = (
    config: StormConfig<"logging", LoggingConfig>,
    name?: string
  ): pino.BaseLogger => {
    let pinoLogger!: pino.BaseLogger;

    const transports = getTransports(config, name);
    if (transports) {
      pinoLogger = pino(transports);
    }

    pinoLogger.debug("The Storm log has ben initialized");

    return pinoLogger;
  };

  #config: StormConfig<"logging", LoggingConfig>;
  #name: string;
  #baseLogger: pino.BaseLogger;
  #loggers: ILoggerWrapper[];

  #processes: Map<string, StormTime> = new Map();

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(
    config: StormConfig<"logging", LoggingConfig>,
    loggers: ILoggerWrapper[] = [],
    name?: string
  ) {
    const logger = StormLog.initialize(config, name);

    this.#config = config;
    this.#name = name ? name : config.name;
    this.#baseLogger = logger;
    this.#loggers = loggers;
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public static success(message: any) {
    this.getLoggers().then(logger => {
      logger.info({ msg: message, level: "success" });
    });
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static fatal(message: any) {
    const error = getCauseFromUnknown(message);

    this.getLoggers().then(logger => {
      logger.fatal({ error, level: "fatal" });
    });
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static error(message: any) {
    const error = getCauseFromUnknown(message);

    this.getLoggers().then(logger => {
      logger.error({ error, level: "error" });
    });
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static exception(message: any) {
    const error = getCauseFromUnknown(message);

    this.getLoggers().then(logger => {
      logger.error({ error, level: "exception" });
    });
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static warn(message: any) {
    this.getLoggers().then(logger => {
      logger.warn(message);
    });
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static info(message: any) {
    this.getLoggers().then(logger => {
      logger.info(message);
    });
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static debug(message: any) {
    this.getLoggers().then(logger => {
      logger.debug(message);
    });
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static trace(message: any) {
    this.getLoggers().then(logger => {
      logger.trace(message);
    });
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static log(message: any) {
    this.getLoggers().then(logger => {
      logger.info(message);
    });
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   * @param startTime - The start time of the process
   * @param name - The name of the process
   */
  public static stopwatch(startTime: StormTime, name?: string) {
    this.getLoggers().then(logger => {
      logger.info(
        `⏱️ The${name ? ` ${name}` : ""} process took ${formatSince(
          startTime.since()
        )} to complete`
      );
    });
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public success(message: any) {
    this.#baseLogger.info({ msg: message, level: "success" });
    Promise.all(this.#loggers.map(logger => logger.success(message)));
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public fatal(message: any) {
    const error = getCauseFromUnknown(message);

    this.#baseLogger.fatal({ error, level: "fatal" });
    Promise.all(this.#loggers.map(logger => logger.fatal(error)));
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public error(message: any) {
    const error = getCauseFromUnknown(message);

    this.#baseLogger.error({ error, level: "error" });
    Promise.all(this.#loggers.map(logger => logger.error(error)));
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public exception(message: any) {
    const error = getCauseFromUnknown(message);

    this.#baseLogger.error({ error, level: "exception" });
    Promise.all(this.#loggers.map(logger => logger.exception(error)));
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public warn(message: any) {
    this.#baseLogger.warn(message);
    Promise.all(this.#loggers.map(logger => logger.warn(message)));
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public info(message: any) {
    this.#baseLogger.info(message);
    Promise.all(this.#loggers.map(logger => logger.info(message)));
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public debug(message: any) {
    this.#baseLogger.debug(message);
    Promise.all(this.#loggers.map(logger => logger.debug(message)));
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public trace(message: any) {
    this.#baseLogger.trace(message);
    Promise.all(this.#loggers.map(logger => logger.trace(message)));
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public log(message: any) {
    this.#baseLogger.info(message);
    Promise.all(this.#loggers.map(logger => logger.log(message)));
  }

  /**
   * Start a process
   *
   * @param name - The name of the process
   */
  public start(name: string) {
    this.#processes.set(name, StormTime.current());
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   *
   * @param name - The name of the process
   * @param startTime - The start time of the process
   */
  public stopwatch(name?: string, startTime?: StormTime) {
    if (!name && !startTime) {
      this.warn("No name or start time was provided to the stopwatch method");
      return;
    }
    if (!startTime && !this.#processes.has(name!)) {
      this.warn(
        `No start time was provided and the ${name} process was never started`
      );
      return;
    }
    if (name && this.#processes.has(name)) {
      startTime = this.#processes.get(name);
    }

    const message = `The ${name ? ` ${name}` : ""} process took ${formatSince(
      startTime!.since()
    )} to complete`;

    this.#baseLogger.info(`⏱️ ${message}`);
    Promise.all(this.#loggers.map(logger => logger.info(message)));

    if (name && this.#processes.has(name)) {
      this.#processes.delete(name);
    }
  }

  /**
   * Add a logger wrapper to the internal loggers list
   *
   * @param wrapper - The logger wrapper to use
   */
  public addWrappedLogger(wrapper: ILoggerWrapper) {
    if (wrapper) {
      this.#loggers.push(wrapper);
    }
  }

  /**
   * Add a logger to the internal loggers list
   *
   * @param logger - The logger to add
   */
  public addLogger(logger: ILogger) {
    if (logger) {
      this.addWrappedLogger(
        LoggerWrapper.wrap(logger, this.#config.modules!.logging)
      );
    }
  }
}
