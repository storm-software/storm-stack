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

import { StormError } from "@storm-stack/errors/storm-error";
import { StormJSON, type JsonObject } from "@storm-stack/json";
import { EMPTY_STRING } from "@storm-stack/types/utility-types";
import { errWithCause } from "pino-std-serializers";

export const createErrorSerializer =
  (stacktrace?: boolean): ((err: Error) => Record<string, any>) =>
  (err: Error) => {
    try {
      const stormError = StormError.create(err);
      if (stacktrace === false) {
        stormError.stack = EMPTY_STRING;
      }

      return {
        ...StormJSON.serialize(stormError as unknown as JsonObject),
        fullMessage: stormError.toString(stacktrace)
      };
    } catch (error_) {
      const stormError = StormError.create(error_);
      stormError.cause = err;

      return errWithCause(stormError);
    }
  };
