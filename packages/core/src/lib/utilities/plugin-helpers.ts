/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { Plugin } from "../../base/plugin";
import { PluginConfigObject } from "../../types/config";
import { __STORM_STACK_IS_PLUGIN__ } from "../../types/plugin";

/**
 * Type guard to check if an object is a Plugin
 *
 * @param plugin - The object to check
 * @returns True if the object is a Plugin, false otherwise
 */
export function isPluginInstance(plugin: unknown): plugin is Plugin {
  return (
    isSetObject(plugin) &&
    __STORM_STACK_IS_PLUGIN__ in plugin &&
    (plugin as Plugin)[__STORM_STACK_IS_PLUGIN__] === true
  );
}

/**
 * Type guard to check if an object is a PluginConfigObject
 *
 * @param plugin - The object to check
 * @returns True if the object is a PluginConfigObject, false otherwise
 */
export function isPluginConfigObject(
  plugin: unknown
): plugin is PluginConfigObject {
  return (
    isSetObject(plugin) && "plugin" in plugin && isSetString(plugin.plugin)
  );
}
