/* eslint-disable @typescript-eslint/no-explicit-any */
import { Serializable } from "@storm-stack/serialization";
import { EMPTY_STRING, NEWLINE_STRING, isFunction } from "@storm-stack/types";
import { getCauseFromUnknown, isStormError } from "./utilities";

export interface StormErrorOptions {
  name?: string;
  message?: string;
  cause?: unknown;
  stack?: string;
  data?: any;
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
    } else {
      if (isFunction(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this._stack = new Error(message).stack;
      }
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
            ? this.code && this.name
              ? `(${this.code})`
              : this.code
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
