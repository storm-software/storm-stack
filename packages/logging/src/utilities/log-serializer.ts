import { StormError, getCauseFromUnknown } from "@storm-stack/errors";
import { JsonObject, serialize } from "@storm-stack/serialization";
import { EMPTY_STRING } from "@storm-stack/utilities";
import { SerializerFn } from "pino";
import { errWithCause } from "pino-std-serializers";

export const createErrorSerializer: SerializerFn =
  (stacktrace?: boolean) => (err: Error) => {
    try {
      const stormError = getCauseFromUnknown(err);
      if (stacktrace === false) {
        stormError.stack = EMPTY_STRING;
      }

      return {
        ...serialize(stormError as unknown as JsonObject),
        fullMessage: stormError.toString(stacktrace)
      };
    } catch (e) {
      const stormError = StormError.create(e);
      stormError.cause = err;

      return errWithCause(stormError);
    }
  };
