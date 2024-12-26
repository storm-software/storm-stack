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

import { ErrorCode } from "../errors";
import { ErrorType } from "../types";

/**
 * Get the default error code for the given error type.
 *
 * @param type - The error type.
 * @returns The default error code.
 */
export function getDefaultCodeFromType<TCode extends string = string>(
  type: ErrorType
): TCode {
  switch (type) {
    case ErrorType.NOT_FOUND: {
      return ErrorCode.record_not_found as TCode;
    }
    case ErrorType.VALIDATION: {
      return ErrorCode.validation_error as TCode;
    }
    case ErrorType.SERVICE_UNAVAILABLE: {
      return ErrorCode.service_unavailable as TCode;
    }
    case ErrorType.ACTION_UNSUPPORTED: {
      return ErrorCode.unsupported_request as TCode;
    }
    case ErrorType.SECURITY: {
      return ErrorCode.general_security_issue as TCode;
    }
    case ErrorType.UNKNOWN: {
      return ErrorCode.unknown_cause as TCode;
    }
    default: {
      return ErrorCode.internal_server_error as TCode;
    }
  }
}

/**
 * Get the default error name for the given error type.
 *
 * @param type - The error type.
 * @returns The default error name.
 */
export function getDefaultNameFromType(type: ErrorType): string {
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
    default: {
      return "System Error";
    }
  }
}
