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
import { ResolvedOptions } from "@storm-stack/core/types/build";
import type { Context } from "@storm-stack/core/types/context";
import { PluginBaseOptions } from "@storm-stack/core/types/plugin";
import {
  ConfigPluginOptions,
  ConfigPluginReflectionRecord
} from "@storm-stack/plugin-config/types";
import type {
  ErrorPluginOptions,
  ErrorPluginResolvedOptions
} from "@storm-stack/plugin-error/types";
import {
  LogConsolePluginOptions,
  LogConsolePluginResolvedOptions
} from "@storm-stack/plugin-log-console/types";

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
   * Options for the console log plugin.
   */
  console?: LogConsolePluginOptions;
}

export interface NodePluginResolvedOptions
  extends ErrorPluginResolvedOptions,
    LogConsolePluginResolvedOptions {}

export type NodePluginContext<
  TOptions extends NodePluginResolvedOptions = NodePluginResolvedOptions
> = Context<ResolvedOptions<TOptions>, ConfigPluginReflectionRecord>;

export type NodeBabelPluginState = BabelPluginState<BabelPluginOptions>;
