import { StormError, getCauseFromUnknown } from "@storm-stack/errors";
import { type JsonObject, StormParser } from "@storm-stack/serialization";
import { EMPTY_STRING } from "@storm-stack/utilities";
import { errWithCause } from "pino-std-serializers";

export const createErrorSerializer =
  (stacktrace?: boolean): ((err: Error) => Record<string, any>) =>
  (err: Error) => {
    try {
      const stormError = getCauseFromUnknown(err);
      if (stacktrace === false) {
        stormError.stack = EMPTY_STRING;
      }

      return {
        ...StormParser.serialize(stormError as unknown as JsonObject),
        fullMessage: stormError.toString(stacktrace)
      };
    } catch (e) {
      const stormError = StormError.create(e);
      stormError.cause = err;

      return errWithCause(stormError);
    }
  };
