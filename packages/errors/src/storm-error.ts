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

import { Serializable } from "@storm-stack/serialization";
import {
  EMPTY_STRING,
  type Indexable,
  NEWLINE_STRING,
  isError,
  isFunction,
  isObject,
  isSetString
} from "@storm-stack/types";
import { ErrorCode } from "./errors";

export interface StormErrorOptions {
  name?: string;
  message?: string;
  cause?: unknown;
  stack?: string;
  data?: any;
}

/**
 * Creates a new StormError instance
 *
 * @param cause - The cause of the error
 * @returns The newly created StormError
 */
export function createStormError<TCode extends string = string>({
  code,
  name,
  message,
  cause,
  stack,
  data
}: StormErrorOptions & { code?: TCode }): StormError<TCode> {
  if (isStormError(cause)) {
    return cause;
  }

  if (cause instanceof Error && cause.name === "StormError") {
    return cause as StormError<TCode>;
  }

  const stormError = new StormError<TCode>(
    (code ?? ErrorCode.internal_server_error) as TCode,
    {
      name,
      message,
      cause,
      stack,
      data
    }
  );

  // Inherit stack from error
  if (cause instanceof Error && cause.stack) {
    stormError.stack = cause.stack;
  }

  return stormError;
}

/**
 * Gets the cause of an unknown error and returns it as a StormError
 *
 * @param cause - The cause of the error in an unknown type
 * @returns The cause of the error in a StormError object or undefined
 */
export function getCauseFromUnknown(cause: unknown): StormError {
  if (isStormError(cause)) {
    return cause;
  }
  if (isError(cause)) {
    return createStormError({
      code: ErrorCode.internal_server_error,
      name: cause.name,
      message: cause.message,
      cause,
      stack: cause.stack
    });
  }
  const type = typeof cause;
  if (type === "undefined" || type === "function" || cause === null) {
    return new StormError(ErrorCode.internal_server_error, {
      cause
    });
  }

  // Primitive types just get wrapped in an error
  if (type !== "object") {
    return new StormError(ErrorCode.internal_server_error, {
      message: String(cause)
    });
  }

  // If it's an object, we'll create a synthetic error
  if (isObject(cause)) {
    const err = new StormError(ErrorCode.unknown_cause, {});

    for (const key of Object.keys(cause)) {
      (err as Indexable)[key] = (cause as Indexable)[key];
    }

    return err;
  }

  return new StormError(ErrorCode.internal_server_error, { cause });
}

/**
 * Type-check to determine if `obj` is a `StormError` object
 *
 * @param value - the object to check
 * @returns The function isStormError is returning a boolean value.
 */
export function isStormError<TCode extends string = any>(
  value: unknown
): value is StormError<TCode> {
  return (
    isError(value) &&
    isSetString((value as unknown as StormError<TCode>)?.code) &&
    isSetString((value as unknown as StormError<TCode>)?.message) &&
    isSetString((value as unknown as StormError<TCode>)?.stack)
  );
}

/**
 * A wrapper around the base JavaScript Error class to be used by Storm Software
 *
 * @decorator `@Serializable()`
 */
@Serializable()
export class StormError<TCode extends string = string> extends Error {
  __proto__ = Error;

  /**
   * The stack trace
   */
  private _stack?: string;

  /**
   * The inner error
   */
  private _cause?: StormError;

  /**
   * The error code
   */
  public code!: TCode;

  /**
   * Additional data to be passed with the error
   */
  public data?: any;

  /**
   * Creates a new StormError instance
   *
   * @param error - The error to create
   * @returns The newly created StormError
   */
  public static create(error?: unknown): StormError {
    return getCauseFromUnknown(error);
  }

  public constructor(
    code: TCode,
    { name, message, cause, stack, data }: StormErrorOptions
  ) {
    super(message, { cause });

    this.code = code;
    this.message ??= message || "An error occurred during processing";
    this.name ??= name || this.constructor.name;
    this.data = data;

    if (stack) {
      this._stack = stack;
    } else if (isFunction(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this._stack = new Error(message).stack;
    }

    Object.setPrototypeOf(this, StormError.prototype);
  }

  /**
   * The cause of the error
   */
  public override get cause(): StormError | undefined {
    return this._cause;
  }

  /**
   * The cause of the error
   */
  public override set cause(_cause: unknown) {
    this._cause = getCauseFromUnknown(_cause);
  }

  /**
   * Prints a displayable/formatted stack trace
   *
   * @returns The stack trace string
   */
  public override get stack(): string {
    return this._stack
      ? NEWLINE_STRING +
          (this._stack || "")
            .split("\n")
            .map(line => line.trim())
            .map(line => {
              if (line.startsWith(`${this.name}: ${this.message}`)) {
                return null;
              }

              if (line.startsWith("at")) {
                return `  ${line}`;
              }

              return line;
            })
            .filter(Boolean)
            .join("\n")
      : EMPTY_STRING;
  }

  /**
   * Store the stack trace
   */
  public override set stack(_stack: string) {
    this._stack = _stack;
  }

  /**
   * The unformatted stack trace
   *
   * @returns The stack trace string
   */
  public get originalStack(): string {
    return super.stack || this.stack;
  }

  /**
   * Prints the display error message string
   *
   * @returns The display error message string
   */
  public print(): string {
    return this.message
      ? `${this.name ? (this.code ? `${this.name} ` : this.name) : EMPTY_STRING} ${
        this.code
          ? (this.code && this.name
            ? `(${this.code})`
            : this.code)
          : EMPTY_STRING
      }${this.code || this.name ? ": " : EMPTY_STRING}${this.message}${
        this.cause
          ? `${NEWLINE_STRING}Cause: ${
            isStormError(this.cause) ? this.cause.print() : this.cause
          }`
          : EMPTY_STRING
      }`
      : EMPTY_STRING;
  }

  /**
   * Prints the error message and stack trace
   *
   * @returns The error message and stack trace string
   */
  public override toString(stacktrace?: boolean): string {
    return (
      this.print() +
      (stacktrace === false
        ? ""
        : ` ${NEWLINE_STRING}Stack Trace: ${NEWLINE_STRING}${this.stack}`)
    );
  }
}
