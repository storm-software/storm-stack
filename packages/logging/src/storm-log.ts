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
import { StormDateTime } from "@storm-stack/date-time/storm-date-time";
import { formatSince } from "@storm-stack/date-time/utilities/format-since";
import { StormError, getCauseFromUnknown } from "@storm-stack/errors";
import type { Logger, LoggerOptions as PinoLoggerOptions } from "pino";
import pino from "pino";
import { LoggingErrorCode } from "./errors";
import type { ILoggerWrapper } from "./types";
import { LogLevel, getLogLevel } from "./utilities/get-log-level";
import { getPinoOptions } from "./utilities/get-pino-options";

/**
 * The default logger class.
 *
 * @remarks
 * This logger writes to the console.
 */
export class StormLog {
  static #name: string;

  static #logger: Logger<PinoLoggerOptions>;

  static #logLevel: LogLevel;

  static #additionalLoggers: ILoggerWrapper[] = [];

  public static get name() {
    return StormLog.#name;
  }

  protected static getLogger = (): Logger<PinoLoggerOptions> => {
    if (!StormLog.#logger) {
      throw new StormError(LoggingErrorCode.logs_uninitialized, {
        message:
          "The Storm Log has not been initialized. Please initialize the logs by invoking `StormLog.initialize` before using them"
      });
    }

    return StormLog.#logger;
  };

  /**
   * Initialize the logs.
   *
   * @param config - The Storm config
   * @param name - The name of the project to initialized the loggers for
   * @returns The initialized loggers
   */
  public static initialize = (
    config: StormConfig,
    name: string = "Storm",
    streams: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[] = []
  ) => {
    const pinoLogger: Logger<PinoLoggerOptions> =
      streams.length > 0
        ? pino(
            getPinoOptions(config, name),
            pino.multistream(streams, { dedupe: false })
          )
        : pino(getPinoOptions(config, name));
    pinoLogger.debug("The Storm log has ben initialized");

    StormLog.#name = name;
    StormLog.#logger = pinoLogger;
    StormLog.#logLevel = getLogLevel(config.logLevel);
  };

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  protected constructor() {}

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public static success(message: any) {
    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.INFO) {
      logger.info({ message, level: "success" });

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.info(message))
      );
    }
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static fatal(message: any) {
    const error = getCauseFromUnknown(message);

    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.FATAL) {
      logger.fatal({ error, level: "fatal" });

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.fatal(error))
      );
    }
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static error(message: any) {
    const error = getCauseFromUnknown(message);

    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.ERROR) {
      logger.error({ error, level: "error" });

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.error(error))
      );
    }
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static exception(message: any) {
    const error = getCauseFromUnknown(message);

    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.ERROR) {
      logger.error({ error, level: "exception" });

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.exception(error))
      );
    }
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static warn(message: any) {
    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.WARN) {
      logger.warn(message);

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.warn(message))
      );
    }
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static info(message: any) {
    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.INFO) {
      logger.info(message);

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.info(message))
      );
    }
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static debug(message: any) {
    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.DEBUG) {
      logger.debug(message);

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.debug(message))
      );
    }
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static trace(message: any) {
    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.TRACE) {
      logger.trace(message);

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.trace(message))
      );
    }
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static log(message: any) {
    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.INFO) {
      logger.info({ message, level: "log" });

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.info(message))
      );
    }
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   * @param startTime - The start time of the process
   * @param name - The name of the process
   */
  public static stopwatch(startTime: StormDateTime, name?: string) {
    const logger = StormLog.getLogger();
    if (StormLog.#logLevel >= LogLevel.INFO) {
      const message = `\n⏱️  Completed ${name ? ` ${name}` : ""} process in ${formatSince(startTime.since())}\n`;
      logger.info(message);

      Promise.all(
        StormLog.#additionalLoggers.map(logger => logger.info(message))
      );
    }
  }

  /**
   * Start a logging process to track
   *
   * @param name - The name of the process
   */
  public static start(name?: string): StormDateTime {
    if (this.#logLevel >= LogLevel.INFO) {
      this.#logger.info(`▶️  Starting process ${name}`);
    }

    return StormDateTime.current();
  }

  // /**
  //  * Write an message to the logs specifying how long it took to complete a process
  //  *
  //  * @param name - The name of the process
  //  * @param startTime - The start time of the process
  //  */
  // public stopwatch(name?: string, startTime?: StormTime) {
  //   let _startTime = startTime;
  //   if (this.#logLevel < LogLevel.INFO) {
  //     return;
  //   }

  //   if (!name && !_startTime) {
  //     this.warn("No name or start time was provided to the stopwatch method");
  //     return;
  //   }
  //   if (!_startTime && !this.#processes.some(item => item.name === name)) {
  //     this.warn(
  //       `No start time was provided and the ${name} process was never started`
  //     );
  //     return;
  //   }
  //   if (name && this.#processes.some(item => item.name === name)) {
  //     _startTime = this.#processes.find(item => item.name === name)?.startedAt;
  //   }

  //   let proc = name;
  //   if (
  //     this.#processes.length > 0 &&
  //     proc &&
  //     this.#processes.some(item => item.name === proc)
  //   ) {
  //     proc = this.#processes
  //       .map(item => item.name)
  //       .slice(
  //         0,
  //         this.#processes.findIndex(item => item.name === proc)
  //       )
  //       .join(" ❯ ");
  //   }

  //   const message = `\n${proc ? `⏱️ Completed ${proc}` : "The process has completed"} in ${
  //     _startTime ? formatSince(_startTime.since()) : "0ms"
  //   }\n`;

  //   this.#logger.info(message);
  //   Promise.all(this.additionalLoggers.map(logger => logger.info(message)));

  //   if (name && this.#processes.some(item => item.name === name)) {
  //     const index = this.#processes.findLastIndex(item => item.name === name);
  //     if (index) {
  //       this.#processes.splice(index, 1);
  //     }
  //   }
  // }

  // /**
  //  * Start a process
  //  *
  //  * @param options - The options of the child process
  //  */
  // public child(options: { name: string } & Record<string, any>): IStormLog {
  //   return new StormLog(
  //     this.config,
  //     `${this.name} ❯ ${options?.name}`,
  //     this.additionalLoggers
  //   );
  // }

  /**
   * Add a logger wrapper to the internal loggers list
   *
   * @param wrapper - The logger wrapper to use
   */
  public static addLogger(wrapper: ILoggerWrapper) {
    if (wrapper) {
      StormLog.#additionalLoggers.push(wrapper);
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
