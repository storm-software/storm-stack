/* eslint-disable @typescript-eslint/no-explicit-any */
import { EMPTY_STRING } from "@storm-software/utilities";
import StackTracey from "stacktracey";

export interface StormErrorOptions {
  message?: string;
  cause?: any;
  stack?: string;
  data?: any;
  innerError?: Error;
}

/**
 * A wrapper of the and Error class
 */
export class StormError<TCode extends string> extends Error {
  __proto__ = Error;

  public data?: any;
  public innerError?: Error;

  protected constructor(
    public code: TCode,
    { message, cause, stack, data, innerError }: StormErrorOptions = {}
  ) {
    super(message, { cause });

    this.name ??= "StormError";
    stack && (this.stack = stack);
    this.data = data;
    this.innerError = innerError;

    Object.setPrototypeOf(this, StormError.prototype);
  }

  /**
   * Prints the error message and stack trace
   *
   * @returns The error message and stack trace string
   */
  public override toString(): string {
    return `${this.name} (${this.code}): ${this.message}\nStack Trace:\n${
      this.stack
        ? new StackTracey(this.stack).withSources().asTable()
        : EMPTY_STRING
    }`;
  }
}
