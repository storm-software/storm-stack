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

import { PluginObj } from "@babel/core";
import { BabelAPI } from "@babel/helper-plugin-utils";
import {
  BabelPlugin,
  BabelPluginOptions,
  BabelPluginPass
} from "@storm-stack/core/types/babel";
import { LogFn } from "@storm-stack/core/types/config";
import { Context } from "@storm-stack/core/types/context";

export interface BabelPluginBuilderParams<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context
> {
  name: string;
  log: LogFn;
  api: BabelAPI;
  options: TOptions;
  context: TContext;
  dirname: string;
}

export type BabelPluginBuilder<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context,
  TState = any
> = (
  params: BabelPluginBuilderParams<TOptions, TContext>
) => PluginObj<TState & BabelPluginPass<TOptions>>;

export type DeclareReturn<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState = any
> = PluginObj<TOptions & BabelPluginPass<TOptions, TState>>;

export type DeclareBabelPluginReturn<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context,
  TState = any
> = Omit<BabelPlugin<TOptions, TContext, TState>, "_name"> &
  Required<Pick<BabelPlugin<TOptions, TContext, TState>, "_name">>;
