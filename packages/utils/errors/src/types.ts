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

import { ValidationDetails } from "@storm-stack/types/utility-types/validations";

export type StormErrorOptions<
  TErrorType extends ErrorType = typeof ErrorType.EXCEPTION,
  TData = any
> = {
  /**
   * The error name.
   */
  name?: string;

  /**
   * The error message.
   */
  message?: string;

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
  type?: TErrorType;

  /**
   * Additional data to be included with the error.
   */
  data: TData;
};

export type StormValidationErrorOptions = StormErrorOptions<
  typeof ErrorType.VALIDATION,
  ValidationDetails[]
>;

export type ErrorType =
  | "exception"
  | "not_found"
  | "validation"
  | "service_unavailable"
  | "unsupported"
  | "security"
  | "unknown";
export const ErrorType = {
  EXCEPTION: "exception" as ErrorType,
  NOT_FOUND: "not_found" as ErrorType,
  VALIDATION: "validation" as ErrorType,
  SERVICE_UNAVAILABLE: "service_unavailable" as ErrorType,
  ACTION_UNSUPPORTED: "action_unsupported" as ErrorType,
  SECURITY: "security" as ErrorType,
  UNKNOWN: "unknown" as ErrorType
};
