/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import type { StormConfig } from "@storm-software/config";
import { StormTime } from "@storm-stack/date-time/storm-time";
import { formatSince } from "@storm-stack/date-time/utilities/format-since";
import { StormError, getCauseFromUnknown } from "@storm-stack/errors";
import type { Logger, LoggerOptions as PinoLoggerOptions } from "pino";
import pino from "pino";
import { LoggerWrapper } from "./composition/logger-wrapper";
import { LoggingErrorCode } from "./errors";
import type {
  GetLoggersResult,
  ILogger,
  ILoggerWrapper,
  IStormLog
} from "./types";
import {
  LogLevel,
  type LogLevelLabel,
  getLogLevel
} from "./utilities/get-log-level";
import { getPinoOptions } from "./utilities/get-pino-options";

/**
 * The default logger class.
 *
 * @remarks
 * This logger writes to the console.
 */
export class StormLog implements IStormLog {
  protected static logger: Logger<PinoLoggerOptions>;

  protected static logLevel: LogLevel;

  protected static logLevelLabel: LogLevelLabel;

  protected static getLoggers = (): Promise<GetLoggersResult> => {
    if (!StormLog.logger) {
      throw new StormError(LoggingErrorCode.logs_uninitialized, {
        message:
          "The Storm Log has not been initialized. Please initialize the logs by invoking `StormLog.initialize` before using them"
      });
    }

    return Promise.resolve({
      ...StormLog.logger,
      logLevel: StormLog.logLevel,
      logLevelLabel: StormLog.logLevelLabel
    });
  };

  /**
   * Initialize the logs.
   *
   * @param config - The Storm config
   * @param name - The name of the project to initialized the loggers for
   * @returns The initialized loggers
   */
  protected static initialize = (
    config: StormConfig,
    name?: string,
    streams: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[] = []
  ): Logger<PinoLoggerOptions> => {
    const pinoLogger: Logger<PinoLoggerOptions> =
      streams.length > 0
        ? pino(
            getPinoOptions(config, name),
            pino.multistream(streams, { dedupe: false })
          )
        : pino(getPinoOptions(config, name));
    pinoLogger.debug("The Storm log has ben initialized");

    return pinoLogger;
  };

  #logger: Logger<PinoLoggerOptions>;

  #logLevel: LogLevel;

  #processes: Array<{ name: string; startedAt: StormTime }> = [];

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  protected constructor(
    protected config: StormConfig,
    protected name?: string,
    protected additionalLoggers: ILoggerWrapper[] = []
  ) {
    this.name = name || config.name;

    this.#logger = StormLog.initialize(
      this.config,
      this.name,
      StormLog.getStreams()
    );
    this.#logLevel = getLogLevel(config.logLevel);
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
    config: StormConfig,
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
    StormLog.getLoggers().then(logger => {
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

    StormLog.getLoggers().then(logger => {
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

    StormLog.getLoggers().then(logger => {
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

    StormLog.getLoggers().then(logger => {
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
    StormLog.getLoggers().then(logger => {
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
    StormLog.getLoggers().then(logger => {
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
    StormLog.getLoggers().then(logger => {
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
    StormLog.getLoggers().then(logger => {
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
    StormLog.getLoggers().then(logger => {
      StormLog.logLevel >= LogLevel.INFO && logger.info(message);
    });
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   * @param startTime - The start time of the process
   * @param name - The name of the process
   */
  public static stopwatch(startTime: StormTime, name?: string) {
    StormLog.getLoggers().then(logger => {
      StormLog.logLevel >= LogLevel.INFO &&
        logger.info(
          `\n⏱️  Completed ${name ? ` ${name}` : ""} process in ${formatSince(startTime.since())}\n`
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
        this.additionalLoggers.map(logger => logger.success(message))
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
      Promise.all(this.additionalLoggers.map(logger => logger.fatal(error)));
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
      Promise.all(this.additionalLoggers.map(logger => logger.error(error)));
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
        this.additionalLoggers.map(logger => logger.exception(error))
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
      Promise.all(this.additionalLoggers.map(logger => logger.warn(message)));
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
      Promise.all(this.additionalLoggers.map(logger => logger.info(message)));
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
      Promise.all(this.additionalLoggers.map(logger => logger.debug(message)));
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
      Promise.all(this.additionalLoggers.map(logger => logger.trace(message)));
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
      Promise.all(this.additionalLoggers.map(logger => logger.log(message)));
    }
  }

  /**
   * Start a logging process to track
   *
   * @param name - The name of the process
   */
  public start(name: string) {
    if (
      this.#logLevel >= LogLevel.INFO &&
      !this.#processes.some(item => item.name === name)
    ) {
      this.#processes.push({ name, startedAt: StormTime.current() });
      this.#logger.info(
        `▶️  Starting process ${this.#processes.map(item => item.name).join(" ❯ ")}`
      );
    }
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   *
   * @param name - The name of the process
   * @param startTime - The start time of the process
   */
  public stopwatch(name?: string, startTime?: StormTime) {
    let _startTime = startTime;
    if (this.#logLevel < LogLevel.INFO) {
      return;
    }

    if (!name && !_startTime) {
      this.warn("No name or start time was provided to the stopwatch method");
      return;
    }
    if (!_startTime && !this.#processes.some(item => item.name === name)) {
      this.warn(
        `No start time was provided and the ${name} process was never started`
      );
      return;
    }
    if (name && this.#processes.some(item => item.name === name)) {
      _startTime = this.#processes.find(item => item.name === name)?.startedAt;
    }

    let proc = name;
    if (
      this.#processes.length > 0 &&
      proc &&
      this.#processes.some(item => item.name === proc)
    ) {
      proc = this.#processes
        .map(item => item.name)
        .slice(
          0,
          this.#processes.findIndex(item => item.name === proc)
        )
        .join(" ❯ ");
    }

    const message = `\n${proc ? `⏱️ Completed ${proc}` : "The process has completed"} in ${
      _startTime ? formatSince(_startTime.since()) : "0ms"
    }\n`;

    this.#logger.info(message);
    Promise.all(this.additionalLoggers.map(logger => logger.info(message)));

    if (name && this.#processes.some(item => item.name === name)) {
      const index = this.#processes.findLastIndex(item => item.name === name);
      if (index) {
        this.#processes.splice(index, 1);
      }
    }
  }

  /**
   * Start a process
   *
   * @param options - The options of the child process
   */
  public child(options: { name: string } & Record<string, any>): IStormLog {
    return new StormLog(
      this.config,
      `${this.name} ❯ ${options?.name}`,
      this.additionalLoggers
    );
  }

  /**
   * Add a logger wrapper to the internal loggers list
   *
   * @param wrapper - The logger wrapper to use
   */
  public addWrappedLogger(wrapper: ILoggerWrapper) {
    if (wrapper) {
      this.additionalLoggers.push(wrapper);
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
        LoggerWrapper.wrap(logger, this.config.modules?.logging)
      );
    }
  }

  /**
   * Allow child classes to specify additional pino log streams
   *
   * @returns Additional log streams to use during initialization
   */
  protected static getStreams = (): Array<
    pino.DestinationStream | pino.StreamEntry<pino.Level>
  > => [];
}
