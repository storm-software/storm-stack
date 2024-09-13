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

import { StormDateTime } from "@storm-stack/date-time";
import { StormError } from "@storm-stack/errors";
import { MessageDetails } from "@storm-stack/types/utility-types/messages";

export type ServerResultMeta = {
  /**
   * The correlation ID returned by the server
   */
  correlationId: string;

  /**
   * The request timestamp returned by the server
   */
  timestamp: StormDateTime;

  /**
   * The user ID who made the server request
   */
  userId: string;

  /**
   * The server endpoint/action name
   */
  serviceId: string;
};

export type ServerResult<T> =
  | ({
      /**
       * The meta data returned by the server
       */
      meta: ServerResultMeta;
    } & {
      /**
       * The data returned by the server
       */
      data: T;

      /**
       * The message returned by the server
       */
      message?: MessageDetails;
    })
  | {
      /**
       * The errors returned by the server
       */
      errors: StormError[];
    };
