import { MaybePromise } from "@storm-software/utilities";

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
}

interface LogFunction {
  /* tslint:disable:no-unnecessary-generics */
  <T extends object>(obj: T, msg?: string, ...args: any[]): void;
  (obj: unknown, msg?: string, ...args: any[]): void;
  (msg: string, ...args: any[]): void;
}
