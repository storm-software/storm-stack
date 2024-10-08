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

export type LogLevel = 0 | 10 | 20 | 30 | 40 | 60 | 70 | 100;
export const LogLevel = {
  SILENT: 0 as LogLevel,
  FATAL: 10 as LogLevel,
  ERROR: 20 as LogLevel,
  WARN: 30 as LogLevel,
  INFO: 40 as LogLevel,
  DEBUG: 60 as LogLevel,
  TRACE: 70 as LogLevel,
  ALL: 100 as LogLevel
};

export type LogLevelLabel =
  | "silent"
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace"
  | "all";
export const LogLevelLabel = {
  SILENT: "silent" as LogLevelLabel,
  FATAL: "fatal" as LogLevelLabel,
  ERROR: "error" as LogLevelLabel,
  WARN: "warn" as LogLevelLabel,
  INFO: "info" as LogLevelLabel,
  DEBUG: "debug" as LogLevelLabel,
  TRACE: "trace" as LogLevelLabel,
  ALL: "all" as LogLevelLabel
};

/**
 * Convert the log level label to a log level
 *
 * @param label - The log level label to convert
 * @returns The log level
 */
export const getLogLevel = (label: string): LogLevel => {
  switch (label) {
    case "all": {
      return LogLevel.ALL;
    }
    case "trace": {
      return LogLevel.TRACE;
    }
    case "debug": {
      return LogLevel.DEBUG;
    }
    case "info": {
      return LogLevel.INFO;
    }
    case "warn": {
      return LogLevel.WARN;
    }
    case "error": {
      return LogLevel.ERROR;
    }
    case "fatal": {
      return LogLevel.FATAL;
    }
    case "silent": {
      return LogLevel.SILENT;
    }
    default: {
      return LogLevel.INFO;
    }
  }
};

/**
 * Convert the log level to a log level label
 *
 * @param logLevel - The log level to convert
 * @returns The log level label
 */
export const getLogLevelLabel = (logLevel: number): LogLevelLabel => {
  if (logLevel >= LogLevel.ALL) {
    return LogLevelLabel.ALL;
  }
  if (logLevel >= LogLevel.TRACE) {
    return LogLevelLabel.TRACE;
  }
  if (logLevel >= LogLevel.DEBUG) {
    return LogLevelLabel.DEBUG;
  }
  if (logLevel >= LogLevel.INFO) {
    return LogLevelLabel.INFO;
  }
  if (logLevel >= LogLevel.WARN) {
    return LogLevelLabel.WARN;
  }
  if (logLevel >= LogLevel.ERROR) {
    return LogLevelLabel.ERROR;
  }
  if (logLevel >= LogLevel.FATAL) {
    return LogLevelLabel.FATAL;
  }
  if (logLevel <= LogLevel.SILENT) {
    return LogLevelLabel.SILENT;
  }
  return LogLevelLabel.INFO;
};
