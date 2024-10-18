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

export type ErrorCode =
  | "success"
  | "missing_issue_code"
  | "invalid_config"
  | "failed_to_load_file"
  | "missing_context"
  | "record_not_found"
  | "required_field_missing"
  | "database_query_error"
  | "validation_error"
  | "field_validation_error"
  | "invalid_parameter"
  | "invalid_request"
  | "unsupported_request"
  | "type_error"
  | "service_unavailable"
  | "processing_error"
  | "internal_server_error"
  | "general_security_issue"
  | "user_not_logged_in"
  | "unknown_cause";
export const ErrorCode = {
  success: "success" as ErrorCode,
  missing_issue_code: "missing_issue_code" as ErrorCode,
  invalid_config: "invalid_config" as ErrorCode,
  failed_to_load_file: "failed_to_load_file" as ErrorCode,
  missing_context: "missing_context" as ErrorCode,
  record_not_found: "record_not_found" as ErrorCode,
  required_field_missing: "required_field_missing" as ErrorCode,
  database_query_error: "database_query_error" as ErrorCode,
  validation_error: "validation_error" as ErrorCode,
  field_validation_error: "field_validation_error" as ErrorCode,
  invalid_parameter: "invalid_parameter" as ErrorCode,
  invalid_request: "invalid_request" as ErrorCode,
  unsupported_request: "unsupported_request" as ErrorCode,
  type_error: "type_error" as ErrorCode,
  service_unavailable: "service_unavailable" as ErrorCode,
  processing_error: "processing_error" as ErrorCode,
  internal_server_error: "internal_server_error" as ErrorCode,
  general_security_issue: "general_security_issue" as ErrorCode,
  user_not_logged_in: "user_not_logged_in" as ErrorCode,
  unknown_cause: "unknown_cause" as ErrorCode
};
