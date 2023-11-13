export type ErrorCode =
  | "success"
  | "missing_issue_code"
  | "invalid_config"
  | "failed_to_load_file"
  | "missing_context"
  | "record_not_found"
  | "required_field_missing"
  | "database_query_error"
  | "model_validation_error"
  | "field_validation_error"
  | "invalid_parameter"
  | "invalid_request"
  | "type_error"
  | "processing_error"
  | "user_not_logged_in";
export const ErrorCode = {
  success: "success" as ErrorCode,
  missing_issue_code: "missing_issue_code" as ErrorCode,
  invalid_config: "invalid_config" as ErrorCode,
  failed_to_load_file: "failed_to_load_file" as ErrorCode,
  missing_context: "missing_context" as ErrorCode,
  record_not_found: "record_not_found" as ErrorCode,
  required_field_missing: "required_field_missing" as ErrorCode,
  database_query_error: "database_query_error" as ErrorCode,
  model_validation_error: "model_validation_error" as ErrorCode,
  field_validation_error: "field_validation_error" as ErrorCode,
  invalid_parameter: "invalid_parameter" as ErrorCode,
  invalid_request: "invalid_request" as ErrorCode,
  type_error: "type_error" as ErrorCode,
  processing_error: "processing_error" as ErrorCode,
  internal_server_error: "internal_server_error" as ErrorCode,
  user_not_logged_in: "user_not_logged_in" as ErrorCode
};
