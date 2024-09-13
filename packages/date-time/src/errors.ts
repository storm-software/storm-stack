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

import { ErrorCode } from "@storm-stack/errors";

export type DateTimeErrorCode =
  | ErrorCode
  | "datetime_create_failure"
  | "ms_format"
  | "formatting_failure";
export const DateTimeErrorCode = {
  ...ErrorCode,
  datetime_create_failure: "datetime_create_failure" as DateTimeErrorCode,
  ms_format: "ms_format" as DateTimeErrorCode,
  formatting_failure: "formatting_failure" as DateTimeErrorCode
};
