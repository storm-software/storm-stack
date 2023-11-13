/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonObject, Serializable } from "@storm-software/serialization";
import { EMPTY_STRING } from "@storm-software/utilities";
import StackTracey from "stacktracey";
import { ErrorCode } from "./errors";

export interface StormErrorOptions {
  name?: string;
  message?: string;
  cause?: any;
  stack?: string;
  data?: any;
  innerError?: StormError;
}

/**
 * A wrapper of the and Error class
 */
@Serializable()
export class StormError<TCode extends string = string> extends Error {
  __proto__ = Error;

  public code!: TCode;
  public data?: any;
  public innerError?: StormError;

  public constructor() {
    super();

    Object.setPrototypeOf(this, StormError.prototype);
  }

  public static create<TCode extends string = string>(
    code: TCode,
    { name, message, cause, stack, data, innerError }: StormErrorOptions = {
      name: "StormError",
      message: "An error occurred"
    }
  ) {
    const error = new StormError();

    error.code = code;
    error.message ??= message ?? EMPTY_STRING;
    error.name ??= name ? name : "StormError";
    stack && (error.stack = stack);
    error.cause = cause;
    error.data = data;
    error.innerError = innerError;

    return error;
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

  public serialize(): JsonObject {
    return {
      code: this.code,
      message: this.message,
      stack: this.stack,
      data: this.data,
      innerError: this.innerError?.serialize()
    };
  }

  public deserialize(json: JsonObject) {
    json?.code && (this.code = json.code as TCode);
    json?.message && (this.message = json.message as string);
    json?.stack && (this.stack = json.stack as string);
    json?.data && (this.data = json.data);

    if (json?.innerError) {
      this.innerError = StormError.create(ErrorCode.processing_error);
      this.innerError.deserialize(json.innerError as JsonObject);
    }
  }
}
