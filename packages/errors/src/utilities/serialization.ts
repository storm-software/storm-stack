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

import type { JsonObject, JsonValue } from "@storm-stack/serialization";
import { isSetObject } from "@storm-stack/types";
import { ErrorCode } from "../errors";
import { StormError } from "../storm-error";

/**
 * Serializes a StormError into a JSON object
 *
 * @param error - The error to serialize
 * @returns The serialized error
 */
export function serializeStormError(error: StormError): JsonValue {
  return {
    code: error.code,
    message: error.message,
    stack: error.stack,
    data: error.data,
    cause: error.cause ? serializeStormError(error.cause) : undefined
  };
}

/**
 * Deserializes a JSON object into a StormError
 *
 * @param error - The error to deserialize
 * @returns The deserialized error
 */
export function deserializeStormError(json: JsonValue): StormError {
  if (isSetObject(json)) {
    const { code, message, stack, data, cause } = json as JsonObject;

    const error = new StormError(
      code ? String(code) : ErrorCode.internal_server_error,
      {
        message: String(message),
        stack: String(stack),
        data: String(data)
      }
    );

    if (cause) {
      const errorCause = deserializeStormError(cause as JsonObject);
      if (errorCause) {
        error.cause = errorCause;
      }
    }

    return error;
  }

  return new StormError(ErrorCode.internal_server_error, {
    message: "Could not read server response"
  });
}
