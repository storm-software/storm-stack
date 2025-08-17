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

import { PluginConfig } from "@storm-stack/core/types/config";
import { Context } from "@storm-stack/core/types/context";
import { StoragePluginOptions } from "@storm-stack/devkit/plugins/storage";
import {
  ConfigPluginOptions,
  ConfigPluginReflectionRecord,
  ResolvedConfigPluginOptions
} from "@storm-stack/plugin-config/types";
import { ErrorPluginOptions } from "@storm-stack/plugin-error/types";

export interface NodeConfigPluginOptions extends ConfigPluginOptions {
  /**
   * Options for the error plugin.
   */
  error?: Omit<ErrorPluginOptions, "config">;

  /**
   * A plugin responsible for accessing the persisted configuration storage
   */
  storage?: string | PluginConfig<StoragePluginOptions>;
}

export interface ResolvedNodeConfigPluginOptions {
  config: ResolvedConfigPluginOptions;
}

export type NodeConfigPluginContext = Context<
  ResolvedNodeConfigPluginOptions,
  ConfigPluginReflectionRecord
>;
