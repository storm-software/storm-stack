import { ErrorCode } from "@storm-stack/errors";

export type LoggingErrorCode = ErrorCode | "logs_uninitialized";
export const LoggingErrorCode = {
  ...ErrorCode,
  logs_uninitialized: "logs_uninitialized" as LoggingErrorCode
};
