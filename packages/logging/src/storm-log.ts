import { StormConfig, createStormConfig } from "@storm-software/config-tools";
import { StormTime, formatSince } from "@storm-stack/date-time";
import { getCauseFromUnknown } from "@storm-stack/errors";
import pino from "pino";
import { LoggerWrapper } from "./composition/logger-wrapper";
import { LoggingConfigSchema } from "./schema";
import { ILogger, ILoggerWrapper, IStormLog, LoggingConfig } from "./types";
import {
  LogLevel,
  LogLevelLabel,
  getLogLevel
} from "./utilities/get-log-level";
import { getTransports } from "./utilities/get-transports";

type GetLoggersResult = pino.BaseLogger & {
  logLevel: LogLevel;
  logLevelLabel: LogLevelLabel;
};

/**
 * The default logger class.
 *
 * @remarks
 * This logger writes to the console.
 */
export class StormLog implements IStormLog {
  private static logger: pino.BaseLogger;
  private static logLevel: LogLevel;
  private static logLevelLabel: LogLevelLabel;

  private static getLoggers = async (): Promise<GetLoggersResult> => {
    if (!StormLog.logger) {
      let config = await createStormConfig<"logging", LoggingConfig>(
        "logging",
        LoggingConfigSchema
      );
      StormLog.logger = StormLog.initialize(
        config as StormConfig<"logging", LoggingConfig>
      );
      StormLog.logLevel = getLogLevel(config.logLevel);
      StormLog.logLevelLabel = config.logLevel;
    }

    return {
      ...StormLog.logger,
      logLevel: StormLog.logLevel,
      logLevelLabel: StormLog.logLevelLabel
    };
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
  #logger: pino.BaseLogger;
  #additionalLoggers: ILoggerWrapper[];
  #logLevel: LogLevel;
  #logLevelLabel: LogLevelLabel;

  #processes: Map<string, StormTime> = new Map();

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(
    config: StormConfig<"logging", LoggingConfig>,
    additionalLoggers: ILoggerWrapper[] = [],
    name?: string
  ) {
    const logger = StormLog.initialize(config, name);

    this.#config = config;
    this.#name = name ? name : config.name;

    this.#logger = logger;
    this.#additionalLoggers = additionalLoggers;

    this.#logLevel = getLogLevel(config.logLevel);
    this.#logLevelLabel = config.logLevel;
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public static success(message: any) {
    this.getLoggers().then(logger => {
      StormLog.logLevel >= LogLevel.INFO &&
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
      StormLog.logLevel >= LogLevel.FATAL &&
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
      StormLog.logLevel >= LogLevel.ERROR &&
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
      StormLog.logLevel >= LogLevel.ERROR &&
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
      StormLog.logLevel >= LogLevel.WARN && logger.warn(message);
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
      StormLog.logLevel >= LogLevel.INFO && logger.info(message);
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
      StormLog.logLevel >= LogLevel.DEBUG && logger.debug(message);
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
      StormLog.logLevel >= LogLevel.TRACE && logger.trace(message);
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
      StormLog.logLevel >= LogLevel.INFO && logger.info(message);
    });
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   * @param startTime - The start time of the process
   * @param name - The name of the process
   */
  public static stopwatch(startTime: StormTime, name?: string) {
    this.getLoggers().then(logger => {
      StormLog.logLevel >= LogLevel.INFO &&
        logger.info(
          `⏱️  The${name ? ` ${name}` : ""} process took ${formatSince(
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
    if (this.#logLevel >= LogLevel.INFO) {
      this.#logger.info({ msg: message, level: "success" });
      Promise.all(
        this.#additionalLoggers.map(logger => logger.success(message))
      );
    }
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public fatal(message: any) {
    if (this.#logLevel >= LogLevel.FATAL) {
      const error = getCauseFromUnknown(message);

      this.#logger.fatal({ error, level: "fatal" });
      Promise.all(this.#additionalLoggers.map(logger => logger.fatal(error)));
    }
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public error(message: any) {
    if (this.#logLevel >= LogLevel.ERROR) {
      const error = getCauseFromUnknown(message);

      this.#logger.error({ error, level: "error" });
      Promise.all(this.#additionalLoggers.map(logger => logger.error(error)));
    }
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public exception(message: any) {
    if (this.#logLevel >= LogLevel.ERROR) {
      const error = getCauseFromUnknown(message);

      this.#logger.error({ error, level: "exception" });
      Promise.all(
        this.#additionalLoggers.map(logger => logger.exception(error))
      );
    }
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public warn(message: any) {
    if (this.#logLevel >= LogLevel.WARN) {
      this.#logger.warn(message);
      Promise.all(this.#additionalLoggers.map(logger => logger.warn(message)));
    }
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public info(message: any) {
    if (this.#logLevel >= LogLevel.INFO) {
      this.#logger.info(message);
      Promise.all(this.#additionalLoggers.map(logger => logger.info(message)));
    }
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public debug(message: any) {
    if (this.#logLevel >= LogLevel.DEBUG) {
      this.#logger.debug(message);
      Promise.all(this.#additionalLoggers.map(logger => logger.debug(message)));
    }
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public trace(message: any) {
    if (this.#logLevel >= LogLevel.TRACE) {
      this.#logger.trace(message);
      Promise.all(this.#additionalLoggers.map(logger => logger.trace(message)));
    }
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public log(message: any) {
    if (this.#logLevel >= LogLevel.INFO) {
      this.#logger.info(message);
      Promise.all(this.#additionalLoggers.map(logger => logger.log(message)));
    }
  }

  /**
   * Start a process
   *
   * @param name - The name of the process
   */
  public start(name: string) {
    if (this.#logLevel >= LogLevel.INFO) {
      this.#processes.set(name, StormTime.current());
    }
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   *
   * @param name - The name of the process
   * @param startTime - The start time of the process
   */
  public stopwatch(name?: string, startTime?: StormTime) {
    if (this.#logLevel < LogLevel.INFO) {
      return;
    }

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

    this.#logger.info(`⏱️  ${message}`);
    Promise.all(this.#additionalLoggers.map(logger => logger.info(message)));

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
      this.#additionalLoggers.push(wrapper);
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
