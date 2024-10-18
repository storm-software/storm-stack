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
  ErrorMessageDetails,
  MessageType,
  NEWLINE_STRING,
  ValidationDetails,
  isError,
  isFunction,
  isObject,
  isSetString,
  type Indexable
} from "@storm-stack/types";
import { ErrorCode } from "./errors";
import { ErrorType, type StormErrorOptions } from "./types";
import {
  getDefaultCodeFromType,
  getDefaultNameFromType
} from "./utilities/default-value-helpers";

/**
 * Creates a new StormError instance
 *
 * @param cause - The cause of the error
 * @returns The newly created StormError
 */
export function createStormError<
  TCode extends string = string,
  TErrorType extends ErrorType = ErrorType,
  TData = undefined
>({
  code,
  name,
  type,
  message,
  cause,
  stack,
  data
}: StormErrorOptions<TErrorType, TData> & { code?: TCode }): StormError<
  TCode,
  TErrorType,
  TData
> {
  if (isStormError<TCode>(cause)) {
    return cause as StormError<TCode, TErrorType, TData>;
  }

  if (cause instanceof Error && cause.name === "StormError") {
    return cause as StormError<TCode, TErrorType, TData>;
  }

  const stormError = new StormError<TCode, TErrorType, TData>(
    (code ?? ErrorCode.internal_server_error) as TCode,
    {
      name,
      type,
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
export function getCauseFromUnknown<
  TErrorType extends ErrorType = ErrorType,
  TData = undefined
>(
  cause: unknown,
  type: TErrorType = ErrorType.EXCEPTION as TErrorType,
  data: TData
): StormError<string, TErrorType, TData> {
  if (isStormError(cause)) {
    const result = cause as StormError<string, TErrorType, TData>;
    result.data ??= data;

    return result;
  }

  if (isError(cause)) {
    return createStormError<string, TErrorType, TData>({
      code: getDefaultCodeFromType(type),
      name: cause.name,
      message: cause.message,
      cause,
      stack: cause.stack,
      type,
      data
    });
  }

  const causeType = typeof cause;
  if (causeType === "undefined" || causeType === "function" || cause === null) {
    return new StormError<string, TErrorType, TData>(
      getDefaultCodeFromType(type),
      {
        name: getDefaultNameFromType(type),
        cause,
        type,
        data
      }
    );
  }

  // Primitive types just get wrapped in an error
  if (causeType !== "object") {
    return new StormError<string, TErrorType, TData>(
      getDefaultCodeFromType(type),
      {
        name: getDefaultNameFromType(type),
        type,
        data,
        message: String(cause)
      }
    );
  }

  // If it's an object, we'll create a synthetic error
  if (isObject(cause)) {
    const err = new StormError<string, TErrorType, TData>(
      getDefaultCodeFromType(type),
      { name: getDefaultNameFromType(type), type, data }
    );

    for (const key of Object.keys(cause)) {
      (err as Indexable)[key] = (cause as Indexable)[key];
    }

    return err;
  }

  return new StormError<string, TErrorType, TData>(
    getDefaultCodeFromType(type),
    { name: getDefaultNameFromType(type), cause, type, data }
  );
}

/**
 * Type-check to determine if `obj` is a `StormError` object
 *
 * @param value - the object to check
 * @returns The function isStormError is returning a boolean value.
 */
export function isStormError<TCode extends string = string>(
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
export class StormError<
  TCode extends string = string,
  TErrorType extends ErrorType = typeof ErrorType.EXCEPTION,
  TData = undefined
> extends Error {
  __proto__ = Error;

  /**
   * The stack trace
   */
  private _stack?: string;

  /**
   * The inner error
   */
  private _cause?: StormError<string, ErrorType, any>;

  /**
   * The error code
   */
  public code!: TCode;

  /**
   * Additional data to be passed with the error
   */
  public data: TData;

  /**
   * The type of error response message/event
   */
  public type: TErrorType = ErrorType.EXCEPTION as TErrorType;

  /**
   * Creates a new StormError instance
   *
   * @param error - The error to create
   * @returns The newly created StormError
   */
  public static create<
    TErrorType extends ErrorType = ErrorType,
    TData = undefined
  >(
    error?: unknown,
    type: TErrorType = ErrorType.EXCEPTION as TErrorType,
    data: TData = undefined as TData
  ): StormError<string, TErrorType, TData> {
    return getCauseFromUnknown(error, type, data);
  }

  /**
   * Creates a new Validation StormError instance
   *
   * @param validationDetails - The validation details
   * @param options - The options to use
   * @returns The newly created StormError
   */
  public static createValidation(
    validationDetails: ValidationDetails | ValidationDetails[],
    options?: Omit<StormErrorOptions, "type" | "data">
  ): StormError<string, typeof ErrorType.VALIDATION, ValidationDetails[]> {
    return StormError.create(
      options,
      ErrorType.VALIDATION,
      Array.isArray(validationDetails) ? validationDetails : [validationDetails]
    );
  }

  /**
   * Creates a new Not Found StormError instance
   *
   * @param recordName - The name of the items returned (or in this case *not returned*) in the search results
   * @param options - The options to use
   * @returns The newly created StormError
   */
  public static createNotFound(
    recordName?: string,
    options?: Omit<StormErrorOptions, "type" | "data">
  ): StormError<string, typeof ErrorType.NOT_FOUND, string | undefined> {
    return StormError.create(options, ErrorType.NOT_FOUND, recordName);
  }

  /**
   * Creates a new Security StormError instance
   *
   * @param data - Any relevant data related to the security issue
   * @param options - The options to use
   * @returns The newly created StormError
   */
  public static createSecurity(
    data?: any,
    options?: Omit<StormErrorOptions, "type" | "data">
  ): StormError<string, typeof ErrorType.NOT_FOUND, any> {
    return StormError.create(options, ErrorType.NOT_FOUND, data);
  }

  /**
   * Creates a new Service Unavailable StormError instance
   *
   * @param serviceName - The name of the service that is currently unavailable
   * @param options - The options to use
   * @returns The newly created StormError
   */
  public static createServiceUnavailable(
    serviceName: string,
    options?: Omit<StormErrorOptions, "type" | "data">
  ): StormError<string, typeof ErrorType.SERVICE_UNAVAILABLE, string> {
    return StormError.create(
      options,
      ErrorType.SERVICE_UNAVAILABLE,
      serviceName
    );
  }

  /**
   * Creates a new Action Unsupported StormError instance
   *
   * @param action - The action that is unsupported
   * @param options - The options to use
   * @returns The newly created StormError
   */
  public static createActionUnsupported(
    action: string,
    options?: Omit<StormErrorOptions, "type" | "data">
  ): StormError<string, typeof ErrorType.ACTION_UNSUPPORTED, string> {
    return StormError.create(options, ErrorType.ACTION_UNSUPPORTED, action);
  }

  /**
   * Creates a new Unknown StormError instance
   *
   * @param data - The action that is unsupported
   * @param options - The options to use
   * @returns The newly created StormError
   */
  public static createUnknown(
    data: any,
    options?: Omit<StormErrorOptions, "type" | "data">
  ): StormError<string, typeof ErrorType.UNKNOWN, any> {
    return StormError.create(options, ErrorType.UNKNOWN, data);
  }

  public constructor(
    code: TCode,
    options: StormErrorOptions<TErrorType, TData>
  ) {
    super(options.message, { cause: options.cause });

    this.code = code;
    this.message ??= options.message || "An error occurred during processing";
    this.name ??= options.name || this.constructor.name;
    this.data = options.data as TData;

    if (options.type) {
      this.type = options.type as TErrorType;
    }

    if (options.stack) {
      this._stack = options.stack;
    } else if (isFunction(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this._stack = new Error(options.message).stack;
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
    this._cause = getCauseFromUnknown(_cause, this.type, this.data);
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
              ? `(${this.type} - ${this.code})`
              : `${this.type} - ${this.code}`
            : this.name
              ? `(${this.type})`
              : this.type
        }: ${this.message}${
          this.cause
            ? `${NEWLINE_STRING}Cause: ${
                isStormError(this.cause) ? this.cause.print() : this.cause
              }`
            : EMPTY_STRING
        }${
          this.data
            ? `${NEWLINE_STRING}Data: ${JSON.stringify(this.data, null, 2)}`
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

  /**
   * Convert the error object into a message details object
   *
   * @returns The error message details object
   */
  public toMessage(): ErrorMessageDetails {
    return {
      code: this.code,
      message: this.print(),
      type: MessageType.ERROR
    };
  }
}
