/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import { getFileHeader } from "../helpers/utilities/file-header";

export function writeError() {
  return `${getFileHeader()}
import { StormJSON } from "@stryke/json/storm-json";
import type { ErrorMessageDetails, Indexable } from "@stryke/types";
import {
  EMPTY_STRING,
  isError,
  isFunction,
  isObject,
  isSetString,
  MessageType,
  NEWLINE_STRING
} from "@stryke/types";
import type { IStormError, ParsedStacktrace, StormErrorOptions } from "storm-stack/types";
import { ErrorType } from "storm-stack/types";

/**
 * Get the default error code for the given error type.
 *
 * @param _type - The error type.
 * @returns The default error code.
 */
export function getDefaultCode(_type: ErrorType): string {
  return "00001";
}

/**
 * Get the default error name for the given error type.
 *
 * @param type - The error type.
 * @returns The default error name.
 */
export function getDefaultErrorNameFromErrorType(type: ErrorType): string {
  switch (type) {
    case ErrorType.NOT_FOUND: {
      return "Not Found Error";
    }
    case ErrorType.VALIDATION: {
      return "Validation Error";
    }
    case ErrorType.SERVICE_UNAVAILABLE: {
      return "System Unavailable Error";
    }
    case ErrorType.ACTION_UNSUPPORTED: {
      return "Unsupported Error";
    }
    case ErrorType.SECURITY: {
      return "Security Error";
    }
    case ErrorType.UNKNOWN:
    case ErrorType.EXCEPTION:
    default: {
      return "System Error";
    }
  }
}

/**
 * Creates a new StormError instance
 *
 * @param cause - The cause of the error
 * @returns The newly created StormError
 */
export function createStormError({
  code,
  name,
  type,
  cause,
  stack,
  data
}: StormErrorOptions): StormError {
  if (isStormError(cause)) {
    return cause;
  }

  if (cause instanceof Error && cause.name === "StormError") {
    return cause as StormError;
  }

  const error = new StormError({
    name,
    type,
    code,
    cause,
    stack,
    data
  });

  // Inherit stack from error
  if (cause instanceof Error && cause.stack) {
    error.stack = cause.stack;
  }

  return error;
}

/**
 * Gets the cause of an unknown error and returns it as a StormError
 *
 * @param cause - The cause of the error in an unknown type
 * @returns The cause of the error in a StormError object or undefined
 */
export function getErrorFromUnknown(
  cause: unknown,
  type: ErrorType = ErrorType.EXCEPTION,
  data?: any
): StormError {
  if (isStormError(cause)) {
    const result = cause;
    result.data ??= data;

    return result;
  }

  if (isError(cause)) {
    return createStormError({
      code: getDefaultCode(type),
      name: cause.name,
      cause,
      stack: cause.stack,
      type,
      data
    });
  }

  const causeType = typeof cause;
  if (causeType === "undefined" || causeType === "function" || cause === null) {
    return new StormError({
      name: getDefaultErrorNameFromErrorType(type),
      code: getDefaultCode(type),
      cause,
      type,
      data
    });
  }

  // Primitive types just get wrapped in an error
  if (causeType !== "object") {
    return new StormError({
      name: getDefaultErrorNameFromErrorType(type),
      code: getDefaultCode(type),
      type,
      data
    });
  }

  // If it's an object, we'll create a synthetic error
  if (isObject(cause)) {
    const err = new StormError({
      name: getDefaultErrorNameFromErrorType(type),
      code: getDefaultCode(type),
      type,
      data
    });

    for (const key of Object.keys(cause)) {
      // eslint-disable-next-line ts/no-unsafe-assignment
      (err as Indexable)[key] = (cause as Indexable)[key];
    }

    return err;
  }

  return new StormError({
    name: getDefaultErrorNameFromErrorType(type),
    code: getDefaultCode(type),
    cause,
    type,
    data
  });
}

/**
 * Type-check to determine if \`obj\` is a \`StormError\` object
 *
 * @param value - the object to check
 * @returns The function isStormError is returning a boolean value.
 */
export function isStormError(value: unknown): value is StormError {
  return (
    isError(value) &&
    isSetString((value as StormError)?.code) &&
    isSetString((value as StormError)?.type) &&
    isSetString((value as StormError)?.stack)
  );
}

/**
 * A wrapper around the base JavaScript Error class to be used in Storm Stack applications
 */
export class StormError extends Error implements IStormError {
  __proto__ = Error;

  /**
   * The stack trace
   */
  #stack?: string;

  /**
   * The inner error
   */
  #cause?: IStormError;

  /**
   * The error code
   */
  public code!: string;

  /**
   * Additional data to be passed with the error
   */
  public data: any;

  /**
   * The error message parameters
   */
  public params?: string[];

  /**
   * The type of error response message/event
   */
  public type: ErrorType = ErrorType.EXCEPTION;

  /**
   * The StormError constructor
   *
   * @param options - The options for the error
   */
  public constructor(options: StormErrorOptions | string) {
    super(
      "An error occurred during processing",
      isSetString(options) ? undefined : { cause: options.cause }
    );

    if (!isSetString(options)) {
      this.code = options.code;

      if (options.type) {
        this.type = options.type;
      }

      this.name = options.name || getDefaultErrorNameFromErrorType(this.type);
      this.data = options.data;
      this.params = options.params;
      this.cause ??= options.cause;

      if (options.stack) {
        this.#stack = options.stack;
        // eslint-disable-next-line ts/unbound-method
      } else if (isFunction(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.#stack = new Error(options.code).stack;
      }
    }

    Object.setPrototypeOf(this, StormError.prototype);
  }

  /**
   * The cause of the error
   */
  public override get cause(): IStormError | undefined {
    return this.#cause;
  }

  /**
   * The cause of the error
   */
  public override set cause(cause: unknown) {
    this.#cause = getErrorFromUnknown(cause, this.type, this.data);
  }

  /**
   * The parsed stack traces from the raw stack string
   *
   * @returns The parsed stack traces
   */
  public get stacktrace(): ParsedStacktrace[] {
    const stacktrace: ParsedStacktrace[] = [];
    if (this.#stack) {
      for (const line of this.#stack.split(NEWLINE_STRING)) {
        const parsed =
          /^\\s+at (?:(?<function>[^)]+) \\()?(?<source>[^)]+)\\)?$/u.exec(line)
            ?.groups as
            | Partial<Record<keyof ParsedStacktrace, string>>
            | undefined;
        if (!parsed) {
          continue;
        }

        if (!parsed.source) {
          continue;
        }

        const parsedSource =
          /^(?<source>.+):(?<line>\\d+):(?<column>\\d+)$/u.exec(
            parsed.source
          )?.groups;
        if (parsedSource) {
          Object.assign(parsed, parsedSource);
        }

        if (
          /^[/\\\\](?![/\\\\])|^[/\\\\]{2}(?!\\.)|^[a-z]:[/\\\\]/i.test(parsed.source)
        ) {
          parsed.source = \`file://\${parsed.source}\`;
        }

        if (parsed.source === import.meta.url) {
          continue;
        }

        for (const key of ["line", "column"] as const) {
          if (parsed[key]) {
            parsed[key] = Number(parsed[key]).toString();
          }
        }

        stacktrace.push(parsed as ParsedStacktrace);
      }
    }

    return stacktrace;
  }

  /**
   * Prints a displayable/formatted stack trace
   *
   * @returns The stack trace string
   */
  public override get stack(): string {
    return this.stacktrace
      .filter(Boolean)
      .map(line => {
        return \`    at \${line.function} (\${line.source}:\${line.line}:\${line.column})\`;
      })
      .join(NEWLINE_STRING);
  }

  /**
   * Store the stack trace
   */
  public override set stack(stack: string) {
    this.#stack = stack;
  }

  /**
   * The unformatted stack trace
   *
   * @returns The stack trace string
   */
  public get originalStack(): string | undefined {
    return this.#stack;
  }

  /**
   * Prints the display error message string
   *
   * @param includeData - Whether to include the data in the error message
   * @returns The display error message string
   */
  public format(includeData = $storm.env.INCLUDE_ERROR_DATA): string {
    return this.message
      ? \`\${this.name && this.name !== this.constructor.name ? (this.code ? \`\${this.name} \` : this.name) : EMPTY_STRING} \${
          this.code
            ? this.code && this.name
              ? \`[\${this.type} - \${this.code}]\`
              : \`\${this.type} - \${this.code}\`
            : this.name
              ? \`[\${this.type}]\`
              : this.type
        }: \${this.message}\${
          this.cause
            ? \` \${NEWLINE_STRING}Cause: \${
                isError(this.cause) ? this.cause.format() : this.cause
              }\`
            : EMPTY_STRING
        }\${
          includeData && this.data
            ? \` \${NEWLINE_STRING}Data: \${StormJSON.stringify(this.data)}\`
            : EMPTY_STRING
        }\`
      : EMPTY_STRING;
  }

  /**
   * Prints the error message and stack trace
   *
   * @param stacktrace - Whether to include the stack trace in the error message
   * @param includeData - Whether to include the data in the error message
   * @returns The error message and stack trace string
   */
  public override toString(
    stacktrace = $storm.env.STACKTRACE,
    includeData = $storm.env.INCLUDE_ERROR_DATA
  ): string {
    return (
      this.format(includeData) +
      (stacktrace
        ? EMPTY_STRING
        : \` \${NEWLINE_STRING}Stack Trace: \${NEWLINE_STRING}\${this.stack}\`)
    );
  }

  /**
   * Convert the error object into a message details object
   *
   * @returns The error message details object
   */
  public toMessage(stacktrace = $storm.env.STACKTRACE): ErrorMessageDetails {
    return {
      code: this.code,
      message: this.toString(stacktrace),
      type: MessageType.ERROR
    };
  }
}

  `;
}
