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

import type { PluginAPI } from "@babel/core";
import {
  BabelPlugin,
  BabelPluginOptions,
  BabelPluginState
} from "@storm-stack/core/types/babel";
import { LogFn } from "@storm-stack/core/types/config";

export interface BabelPluginBuilderParams<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
> {
  name: string;
  log: LogFn;
  api: PluginAPI;
  options: TOptions;
  state: TState;
  dirname: string;
}

export type BabelPluginBuilder<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
> = (
  params: BabelPluginBuilderParams<TOptions, TState>
) => BabelPlugin<TOptions, TState>;
