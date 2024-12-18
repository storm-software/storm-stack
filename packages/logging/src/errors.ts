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

import { ErrorCode } from "@storm-stack/errors/errors";

export type LoggingErrorCode =
  | ErrorCode
  | "logs_uninitialized"
  | "invalid_init_params";
export const LoggingErrorCode = {
  ...ErrorCode,
  invalid_init_params: "invalid_init_params" as LoggingErrorCode,
  logs_uninitialized: "logs_uninitialized" as LoggingErrorCode
};
