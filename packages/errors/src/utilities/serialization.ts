import { JsonObject, JsonValue } from "@storm-software/serialization/types";
import { isSetObject } from "@storm-software/utilities/type-checks/is-set-object";
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
export function deserializeStormError(json: JsonValue): StormError | null {
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
      errorCause && (error.cause = errorCause);
    }

    return error;
  }

  return null;
}
