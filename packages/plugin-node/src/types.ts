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
import { PluginBaseConfig } from "@storm-stack/core/types/plugin";
import { LogPluginConfig } from "@storm-stack/devkit/plugins/log";
import type {
  DotenvPluginConfig,
  ResolvedDotenvOptions
} from "@storm-stack/plugin-dotenv/types";
import type { ErrorPluginConfig } from "@storm-stack/plugin-error/types";

export interface NodePluginConfig extends PluginBaseConfig {
  /**
   * Options for the dotenv plugin.
   */
  dotenv?: DotenvPluginConfig;

  /**
   * Options for the error plugin.
   */
  error?: Omit<ErrorPluginConfig, "dotenv">;

  /**
   * Options for the logging plugin(s).
   */
  logging?: Record<string, LogPluginConfig> & {
    console?: LogPluginConfig;
  };
}

export interface NodePluginContextOptions {
  dotenv: ResolvedDotenvOptions;
  error: ErrorPluginConfig;
  logging: Record<string, LogPluginConfig> & {
    console: LogPluginConfig;
  };
}

export type NodePluginContext = Context<NodePluginContextOptions>;

export type NodeBabelPluginState = BabelPluginState<
  BabelPluginOptions,
  NodePluginContext
>;
