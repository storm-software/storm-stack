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

export type FileSystemErrorCode =
  | ErrorCode
  | "invalid_file_path"
  | "invalid_file_content"
  | "file_does_not_exist"
  | "file_write_failure";
export const FileSystemErrorCode = {
  ...ErrorCode,
  invalid_file_path: "invalid_file_path" as FileSystemErrorCode,
  invalid_file_content: "invalid_file_content" as FileSystemErrorCode,
  file_does_not_exist: "file_does_not_exist" as FileSystemErrorCode,
  file_write_failure: "file_write_failure" as FileSystemErrorCode,
  file_read_failure: "file_read_failure" as FileSystemErrorCode
};
