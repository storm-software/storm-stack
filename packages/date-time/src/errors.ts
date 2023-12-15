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
