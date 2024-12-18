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
import { StormError } from "@storm-stack/errors/storm-error";
import { StormURL } from "@storm-stack/serialization";
import { MessageDetails } from "@storm-stack/types/utility-types/messages";
import { UserBase } from "@storm-stack/types/utility-types/user";

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
   * The details of the user who made the server request
   */
  user: UserBase;

  /**
   * The server endpoint/action url
   */
  url: StormURL;
};

export type ServerResultBody<TData> =
  | {
      /**
       * The data returned by the server
       */
      data: TData;

      /**
       * The display message returned by the server
       */
      message?: MessageDetails;
    }
  | {
      /**
       * The error returned by the server
       */
      error: StormError;
    };

export type ServerResult<TData> = {
  /**
   * The meta data returned by the server
   */
  meta: ServerResultMeta;
} & ServerResultBody<TData>;

// export declare class Response extends BodyMixin {
//   constructor (body?: BodyInit, init?: ResponseInit)

//   readonly headers: Headers
//   readonly ok: boolean
//   readonly status: number
//   readonly statusText: string
//   readonly type: ResponseType
//   readonly url: string
//   readonly redirected: boolean

//   readonly clone: () => Response

//   static error (): Response
//   static json(data: any, init?: ResponseInit): Response
//   static redirect (url: string | URL, status: ResponseRedirectStatus): Response
// }
