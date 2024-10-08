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

import { StormDateTime } from "@storm-stack/date-time/storm-date-time";
import { isStormError, StormError } from "@storm-stack/errors/storm-error";
import { isSetString } from "@storm-stack/types/type-checks/is-set-string";
import { isString } from "@storm-stack/types/type-checks/is-string";
import {
  MessageDetails,
  MessageType
} from "@storm-stack/types/utility-types/messages";
import { uuid } from "@storm-stack/unique-identifier/uuid";
import { ServerResult, ServerResultMeta } from "../server-result";
import { ServerResultType } from "../types";

export interface CreateServerResultMetaOptions {
  correlationId?: string;
  userId: string;
  serviceId: string;
}

export interface CreateServerResultOptions<TData> {
  message?: (Partial<MessageDetails> & Omit<MessageDetails, "type">) | string;
  data: TData;
}

export const createServerResultMeta = ({
  correlationId,
  userId,
  serviceId
}: CreateServerResultMetaOptions): ServerResultMeta => {
  return {
    correlationId: correlationId || uuid(),
    timestamp: StormDateTime.current(),
    userId,
    serviceId
  };
};

export const createServerResult = <TData>(
  meta: CreateServerResultMetaOptions,
  options: CreateServerResultOptions<TData> | StormError | StormError[]
): ServerResult<TData> => {
  if (Array.isArray(options)) {
    return {
      meta: createServerResultMeta(meta),
      status: ServerResultType.ERROR,
      errors: options
    };
  }

  if (isStormError<any>(options)) {
    return {
      meta: createServerResultMeta(meta),
      status: ServerResultType.ERROR,
      errors: [options]
    };
  }

  return {
    meta: createServerResultMeta(meta),
    status: ServerResultType.SUCCESS,
    data: options.data,
    message:
      isSetString(options.message) ||
      Boolean(options.message?.message) ||
      Boolean(options.message?.code)
        ? ((isString(options.message)
            ? { message: options.message, type: MessageType.SUCCESS }
            : {
                type: MessageType.SUCCESS,
                ...options.message
              }) as MessageDetails)
        : undefined
  };
};
