/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

/**
 * The type of error response message/event
 */
export type ErrorType =
  | "general"
  | "not_found"
  | "validation"
  | "service_unavailable"
  | "action_unsupported"
  | "security"
  | "unknown";

/**
 * Interface representing the Storm error options.
 */
export interface StormErrorOptions {
  /**
   * The error name.
   */
  name?: string;

  /**
   * The error code
   */
  code: number;

  /**
   * The error message parameters.
   */
  params?: string[];

  /**
   * The error cause.
   */
  cause?: unknown;

  /**
   * The error stack.
   */
  stack?: string;

  /**
   * The type of error.
   *
   * @defaultValue "exception"
   */
  type?: ErrorType;

  /**
   * Additional data to be included with the error.
   */
  data?: any;
}

export interface ParsedStacktrace {
  column?: number;
  function?: string;
  line?: number;
  source: string;
}

/**
 * The Storm Error interface.
 */
export interface IStormError extends Error {
  /**
   * The error code
   */
  code: number;

  /**
   * The error message parameters
   */
  params: string[];

  /**
   * The type of error that was thrown.
   */
  type: ErrorType;

  /**
   * A url to display the error message
   */
  url: string;

  /**
   * Additional data to be passed with the error
   */
  data?: any;

  /**
   * The underlying cause of the error, if any. This is typically another error object that caused this error to be thrown.
   */
  cause: IStormError | undefined;

  /**
   * The error stack
   *
   * @remarks
   * This is overridden in `StormError` to be a parsed stacktrace
   */
  stack: string;

  /**
   * The parsed stacktrace
   */
  stacktrace: ParsedStacktrace[];

  /**
   * The original stacktrace
   */
  originalStack: string;

  /**
   * Returns a formatted error string that can be displayed to the user.
   */
  toDisplay: () => string;

  /**
   * Internal function to inherit the error
   *
   * @internal
   */
  __proto__: any;
}
