/* eslint-disable @typescript-eslint/no-explicit-any */
import { Serializable } from "@storm-stack/serialization";
import {
  EMPTY_STRING,
  Indexable,
  NEWLINE_STRING,
  isObject
} from "@storm-stack/utilities";
import StackTracey from "stacktracey";
import { ErrorCode } from "./errors";
import { isStormError } from "./utilities";
import {
  deserializeStormError,
  serializeStormError
} from "./utilities/serialization";

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
}: StormErrorOptions & { code: TCode }): StormError<TCode> {
  if (isStormError(cause)) {
    return cause;
  }

  if (cause instanceof Error && cause.name === "StormError") {
    return cause as StormError<TCode>;
  }

  const stormError = new StormError<TCode>(code, {
    name,
    message,
    cause,
    stack,
    data
  });

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
    for (const key in cause) {
      (err as Indexable)[key] = (cause as Indexable)[key];
    }
    return err;
  }

  return new StormError(ErrorCode.internal_server_error, { cause });
}

/**
 * A wrapper around the base JavaScript Error class to be used by Storm Software
 *
 * @decorator `@Serializable()`
 */
@Serializable({
  serialize: serializeStormError,
  deserialize: deserializeStormError
})
export class StormError<TCode extends string = string> extends Error {
  __proto__ = Error;

  /**
   * The error code
   */
  public code!: TCode;

  /**
   * The cause of the error
   */
  public override cause?: StormError;

  /**
   * Additional data to be passed with the error
   */
  public data?: any;

  /**
   * The stack trace
   */
  #stack?: string;

  public constructor(
    code: TCode,
    { name, message, cause, stack, data }: StormErrorOptions = {
      name: "StormError",
      message: "An error occurred during processing"
    }
  ) {
    super(message, { cause });

    this.code = code;
    this.message ??= message ?? EMPTY_STRING;
    this.name ??= name ? name : this.constructor.name;
    this.data = data;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.#stack ??= stack ? stack : new Error(message).stack;
    }

    Object.setPrototypeOf(this, StormError.prototype);
  }

  /**
   * Prints a displayable, formatted the stack trace
   *
   * @returns The stack trace string
   */
  public override get stack(): string {
    return this.#stack
      ? NEWLINE_STRING + new StackTracey(this.#stack).withSources().asTable()
      : EMPTY_STRING;
  }

  /**
   * Store the stack trace
   */
  public override set stack(_stack: string) {
    this.#stack = _stack;
  }

  /**
   * The unformatted stack trace
   *
   * @returns The stack trace string
   */
  public get originalStack(): string {
    return super.stack ? super.stack : this.stack;
  }

  /**
   * Prints the display error message string
   *
   * @returns The display error message string
   */
  public print(): string {
    return this.message
      ? `${
          this.name ? (this.code ? this.name + " " : this.name) : EMPTY_STRING
        } ${
          this.code
            ? this.code && this.name
              ? `(${this.code})`
              : this.code
            : EMPTY_STRING
        }${this.code || this.name ? ": " : EMPTY_STRING}${this.message}`
      : EMPTY_STRING;
  }

  /**
   * Prints the error message and stack trace
   *
   * @returns The error message and stack trace string
   */
  public override toString(): string {
    return `${this.print} ${NEWLINE_STRING}Stack Trace: ${NEWLINE_STRING}${this.stack}`;
  }
}
