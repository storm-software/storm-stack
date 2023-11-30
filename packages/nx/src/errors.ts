import { ErrorCode } from "@storm-software/errors/errors";

export type NxErrorCode = ErrorCode | "executor_failure";
export const NxErrorCode = {
  ...ErrorCode,
  executor_failure: "executor_failure" as ErrorCode,
  generator_failure: "generator_failure" as ErrorCode
};
