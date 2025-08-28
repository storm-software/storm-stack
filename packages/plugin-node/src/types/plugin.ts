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

import {
  BabelPluginOptions,
  BabelPluginState
} from "@storm-stack/core/types/babel";
import type { Context } from "@storm-stack/core/types/context";
import { PluginBaseOptions } from "@storm-stack/core/types/plugin";
import { LogPluginOptions } from "@storm-stack/devkit/plugins/log";
import {
  ConfigPluginOptions,
  ConfigPluginReflectionRecord,
  ResolvedConfigPluginOptions
} from "@storm-stack/plugin-config/types";
import type {
  ErrorPluginOptions,
  ResolvedErrorPluginOptions
} from "@storm-stack/plugin-error/types";

export interface NodePluginOptions extends PluginBaseOptions {
  /**
   * Options for the config plugin.
   */
  config?: ConfigPluginOptions;

  /**
   * Options for the error plugin.
   */
  error?: Omit<ErrorPluginOptions, "config">;

  /**
   * Options for the logging plugin(s).
   */
  logs?: Record<string, LogPluginOptions> & {
    console?: LogPluginOptions;
  };
}

export interface NodePluginContextOptions {
  config: ResolvedConfigPluginOptions;
  error: ResolvedErrorPluginOptions;
  logs: Record<string, LogPluginOptions> & {
    console: LogPluginOptions;
  };
}

export type NodePluginContext = Context<
  NodePluginContextOptions,
  ConfigPluginReflectionRecord
>;

export type NodeBabelPluginState = BabelPluginState<BabelPluginOptions>;
