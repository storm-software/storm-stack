import type { StormConfig } from "@storm-software/config";
import { createStormConfig } from "@storm-software/config-tools";
import { type StormTime, formatSince } from "@storm-stack/date-time";
import { getCauseFromUnknown } from "@storm-stack/errors";
import {
  type GetLoggersResult,
  type ILoggerWrapper,
  type IStormLog,
  LogLevel,
  StormLog,
  getLogLevel
} from "@storm-stack/logging";
import type pino from "pino";
import type { Logger, LoggerOptions as PinoLoggerOptions } from "pino";
import { createFileStreamLogs } from "./logging/create-file-stream-logs";
import { getPinoLogger } from "./logging/get-pino-logger";
import { TelemetryConfigSchema } from "./schema";
import type { TelemetryConfig } from "./types";

/**
 * The default Storm-Stack telemetry class, responsible for logging and tracing system processing.
 *
 * @remarks
 * This logger writes to stdio and to a file and/or [Loki streams](https://grafana.com/oss/loki/).
 */
export class StormTrace extends StormLog implements IStormLog {
  protected static override getLoggers =
    async (): Promise<GetLoggersResult> => {
      if (!StormTrace.logger) {
        const config = await createStormConfig<"telemetry", TelemetryConfig>(
          "telemetry",
          TelemetryConfigSchema
        );
        StormTrace.logger = StormTrace.initialize(
          config as StormConfig<"telemetry", TelemetryConfig>
        );
        StormTrace.logLevel = getLogLevel(config.logLevel);
        StormTrace.logLevelLabel = config.logLevel;
      }

      return {
        ...StormTrace.logger,
        logLevel: StormTrace.logLevel,
        logLevelLabel: StormTrace.logLevelLabel
      };
    };

  /**
   * Initialize the logger.
   *
   * @param config - The Storm config
   * @param name - The name of the project to initialized the loggers for
   * @returns The initialized loggers
   */
  protected static override initialize = (
    config: StormConfig<"telemetry", TelemetryConfig>,
    name?: string,
    streams: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[] = []
  ): Logger<PinoLoggerOptions> => {
    const pinoLogger: Logger<PinoLoggerOptions> = getPinoLogger(
      config,
      name,
      streams,
      config.extensions.logging?.stacktrace
    );
    pinoLogger.debug("The Storm log has ben initialized");

    return pinoLogger;
  };

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  protected constructor(
    protected override config: StormConfig<"telemetry", TelemetryConfig>,
    name?: string,
    additionalLoggers: ILoggerWrapper[] = []
  ) {
    super(config, name, additionalLoggers);
  }

  /**
   * Create a new instance of the logger
   *
   * @param config - The Storm config
   * @param name - The name of the project to initialized the loggers for
   * @param additionalLoggers - Additional loggers to use
   * @returns The initialized logger
   */
  public static override create(
    config: StormConfig<"telemetry", TelemetryConfig>,
    name?: string,
    additionalLoggers: ILoggerWrapper[] = []
  ) {
    return new StormTrace(config, name, additionalLoggers);
  }

  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  public static override success(message: any) {
    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.INFO &&
        logger.info({ msg: message, level: "success" });
    });
  }

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override fatal(message: any) {
    const error = getCauseFromUnknown(message);

    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.FATAL &&
        logger.fatal({ error, level: "fatal" });
    });
  }

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override error(message: any) {
    const error = getCauseFromUnknown(message);

    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.ERROR &&
        logger.error({ error, level: "error" });
    });
  }

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override exception(message: any) {
    const error = getCauseFromUnknown(message);

    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.ERROR &&
        logger.error({ error, level: "exception" });
    });
  }

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override warn(message: any) {
    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.WARN && logger.warn(message);
    });
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override info(message: any) {
    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.INFO && logger.info(message);
    });
  }

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override debug(message: any) {
    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.DEBUG && logger.debug(message);
    });
  }

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override trace(message: any) {
    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.TRACE && logger.trace(message);
    });
  }

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  public static override log(message: any) {
    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.INFO && logger.info(message);
    });
  }

  /**
   * Write an message to the logs specifying how long it took to complete a process
   * @param startTime - The start time of the process
   * @param name - The name of the process
   */
  public static override stopwatch(startTime: StormTime, name?: string) {
    StormTrace.getLoggers().then(logger => {
      StormTrace.logLevel >= LogLevel.INFO &&
        logger.info(
          `\n⏱️  Completed ${name ? ` ${name}` : ""} process in ${formatSince(startTime.since())}\n`
        );
    });
  }

  /**
   * Allow child classes to specify additional pino log streams
   *
   * @returns Additional log streams to use during initialization
   */
  protected override getStreams = (): Array<
    pino.DestinationStream | pino.StreamEntry<pino.Level>
  > => {
    return createFileStreamLogs(this.config);
  };
}
