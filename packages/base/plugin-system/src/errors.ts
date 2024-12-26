import { ErrorCode } from "@storm-stack/errors";

export type PluginSystemErrorCode =
  | ErrorCode
  | "module_not_found"
  | "plugin_not_found"
  | "plugin_loading_failure";
export const PluginSystemErrorCode = {
  ...ErrorCode,
  module_not_found: "module_not_found" as PluginSystemErrorCode,
  plugin_not_found: "plugin_not_found" as PluginSystemErrorCode,
  plugin_loading_failure: "plugin_loading_failure" as PluginSystemErrorCode
};
