import type { StormTime } from "@storm-stack/date-time";
import type { MaybePromise } from "@storm-stack/types";
import type pino from "pino";
import type { LogLevel, LogLevelLabel } from "./utilities/get-log-level";

export interface IStormLog {
  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  success: (...message: any[]) => MaybePromise<void>;

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  fatal: (...message: any[]) => MaybePromise<void>;

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  error: (...message: any[]) => MaybePromise<void>;

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  exception: (...message: any[]) => MaybePromise<void>;

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  warn: (...message: any[]) => MaybePromise<void>;

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  info: (...message: any[]) => MaybePromise<void>;

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  debug: (...message: any[]) => MaybePromise<void>;

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  trace: (...message: any[]) => MaybePromise<void>;

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  log: (...message: any[]) => MaybePromise<void>;

  /**
   * Start a process
   *
   * @param name - The name of the process
   */
  start: (name: string) => MaybePromise<void>;

  /**
   * Write an message to the logs specifying how long it took to complete a process
   *
   * @param name - The name of the process
   * @param startTime - The start time of the process
   */
  stopwatch: (name?: string, startTime?: StormTime) => MaybePromise<void>;

  /**
   * Create a child logger
   *
   * @param name - The name of the child logger
   * @returns The child logger
   */
  child: (options: { name: string } & Record<string, any>) => IStormLog;
}

export interface ILogger {
  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  success?: (message: string) => MaybePromise<void>;

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  fatal?: (message: string) => MaybePromise<void>;

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  error: (message: string) => MaybePromise<void>;

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  exception?: (message: string) => MaybePromise<void>;

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  warn: (message: string) => MaybePromise<void>;

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  info: (message: string) => MaybePromise<void>;

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  debug?: (message: string) => MaybePromise<void>;

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  trace?: (message: string) => MaybePromise<void>;

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  log?: (message: string) => MaybePromise<void>;
}

export interface ILoggerWrapper {
  /**
   * Write a success message to the logs.
   *
   * @param message - The message to print.
   * @returns Either a promise that resolves to void or void.
   */
  success: (message: any) => MaybePromise<void>;

  /**
   * Write a fatal message to the logs.
   *
   * @param message - The fatal message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  fatal: (error: string | Error) => MaybePromise<void>;

  /**
   * Write an error message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  error: (error: string | Error) => MaybePromise<void>;

  /**
   * Write an exception message to the logs.
   *
   * @param message - The message to be displayed.
   * @returns Either a promise that resolves to void or void.
   */
  exception: (error: string | Error) => MaybePromise<void>;

  /**
   * Write a warning message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  warn: (message: any) => MaybePromise<void>;

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  info: (message: any) => MaybePromise<void>;

  /**
   * Write a debug message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  debug: (message: any) => MaybePromise<void>;

  /**
   * Write a trace message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  trace: (message: any) => MaybePromise<void>;

  /**
   * Write an informational message to the logs.
   *
   * @param message - The message to be printed.
   * @returns Either a promise that resolves to void or void.
   */
  log: (message: any) => MaybePromise<void>;
}

export type GetLoggersResult = pino.BaseLogger & {
  logLevel: LogLevel;
  logLevelLabel: LogLevelLabel;
};
