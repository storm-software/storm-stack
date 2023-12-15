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
