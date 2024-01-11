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
import { getPinoLogger } from "./utilities/pino-logger";

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
    const pinoLogger: pino.BaseLogger = getPinoLogger(config, name);
    pinoLogger.debug("The Storm log has ben initialized");

    return pinoLogger;
  };

  private _config: StormConfig<"logging", LoggingConfig>;
  private _name: string;
  private _logger: pino.BaseLogger;
  private _additionalLoggers: ILoggerWrapper[];
  private _logLevel: LogLevel;
  private _logLevelLabel: LogLevelLabel;
  private _processes: Array<{ name: string; startedAt: StormTime }> = [];

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(
    config: StormConfig,
    name?: string,
    additionalLoggers: ILoggerWrapper[] = []
  ) {
    const logger = StormLog.initialize(config, name);

    this._config = config;
    this._name = name ? name : config.name;

    this._logger = logger;
    this._additionalLoggers = additionalLoggers;

    this._logLevel = getLogLevel(config.logLevel);
    this._logLevelLabel = config.logLevel;
  }

  /**
   * Create a new instance of the logger
   *
   * @param config - The Storm config
   * @param name - The name of the project to initialized the loggers for
   * @param additionalLoggers - Additional loggers to use
   * @returns The initialized logger
   */
  public static create(
    config: StormConfig<"logging", LoggingConfig>,
    name?: string,
    additionalLoggers: ILoggerWrapper[] = []
  ) {
    return new StormLog(config, name, additionalLoggers);
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
    if (this._logLevel >= LogLevel.INFO) {
      this._logger.info({ msg: message, level: "success" });
      Promise.all(
        this._additionalLoggers.map(logger => logger.success(message))
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
    if (this._logLevel >= LogLevel.FATAL) {
      const error = getCauseFromUnknown(message);

      this._logger.fatal({ error, level: "fatal" });
      Promise.all(this._additionalLoggers.map(logger => logger.fatal(error)));
    }
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public error(message: any) {
    if (this._logLevel >= LogLevel.ERROR) {
      const error = getCauseFromUnknown(message);

      this._logger.error({ error, level: "error" });
      Promise.all(this._additionalLoggers.map(logger => logger.error(error)));
    }
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public exception(message: any) {
    if (this._logLevel >= LogLevel.ERROR) {
      const error = getCauseFromUnknown(message);

      this._logger.error({ error, level: "exception" });
      Promise.all(
        this._additionalLoggers.map(logger => logger.exception(error))
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
    if (this._logLevel >= LogLevel.WARN) {
      this._logger.warn(message);
      Promise.all(this._additionalLoggers.map(logger => logger.warn(message)));
    }
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public info(message: any) {
    if (this._logLevel >= LogLevel.INFO) {
      this._logger.info(message);
      Promise.all(this._additionalLoggers.map(logger => logger.info(message)));
    }
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public debug(message: any) {
    if (this._logLevel >= LogLevel.DEBUG) {
      this._logger.debug(message);
      Promise.all(this._additionalLoggers.map(logger => logger.debug(message)));
    }
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public trace(message: any) {
    if (this._logLevel >= LogLevel.TRACE) {
      this._logger.trace(message);
      Promise.all(this._additionalLoggers.map(logger => logger.trace(message)));
    }
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public log(message: any) {
    if (this._logLevel >= LogLevel.INFO) {
      this._logger.info(message);
      Promise.all(this._additionalLoggers.map(logger => logger.log(message)));
    }
  }

  /**
   * Start a process
   *
   * @param name - The name of the process
   */
  public start(name: string) {
    if (this._logLevel >= LogLevel.INFO) {
      this._processes.push({ name, startedAt: StormTime.current() });
      this._logger.info(`▶️  Starting process: ${this._processes.join(" > ")}`);
    }
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   *
   * @param name - The name of the process
   * @param startTime - The start time of the process
   */
  public stopwatch(name?: string, startTime?: StormTime) {
    if (this._logLevel < LogLevel.INFO) {
      return;
    }

    if (!name && !startTime) {
      this.warn("No name or start time was provided to the stopwatch method");
      return;
    }
    if (!startTime && !this._processes.some(item => item.name === name)) {
      this.warn(
        `No start time was provided and the ${name} process was never started`
      );
      return;
    }
    if (name && this._processes.some(item => item.name === name)) {
      startTime = this._processes.find(item => item.name === name)?.startedAt;
    }

    let process = name;
    if (
      this._processes.length > 0 &&
      process &&
      this._processes.some(item => item.name === process)
    ) {
      process = this._processes
        .slice(
          0,
          this._processes.findIndex(item => item.name === process)
        )
        .join(" > ");
    }

    const message = `${
      process ? `Completed process: ${process}` : "The process has completed"
    } \n\n⏱️  Process took ${formatSince(startTime!.since())} to complete`;

    this._logger.info(message);
    Promise.all(this._additionalLoggers.map(logger => logger.info(message)));

    if (name && this._processes.some(item => item.name === name)) {
      const index = this._processes.findLastIndex(item => item.name === name);
      if (index) {
        this._processes.splice(index, 1);
      }
    }
  }

  /**
   * Add a logger wrapper to the internal loggers list
   *
   * @param wrapper - The logger wrapper to use
   */
  public addWrappedLogger(wrapper: ILoggerWrapper) {
    if (wrapper) {
      this._additionalLoggers.push(wrapper);
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
        LoggerWrapper.wrap(logger, this._config.modules!.logging)
      );
    }
  }
}
