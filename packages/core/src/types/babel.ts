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

import { NodePath, PluginObject, PluginPass } from "@babel/core";
import type * as t from "@babel/types";
import { ErrorType } from "@storm-stack/types/shared/error";
import { CompilerOptions, TransformOptions } from "./compiler";
import { LogFn } from "./config";
import { Context, SerializedContext } from "./context";

export interface ErrorMessageNode {
  message: string;
  type?: ErrorType;
  params: string[];
  path: NodePath<t.NewExpression> | NodePath<t.CallExpression>;
}

export interface NamedImportDefinition {
  name: string;
  source: string;
  kind: "named";
}

export interface DefaultImportDefinition {
  source: string;
  kind: "default";
}

export type ImportDefinition = NamedImportDefinition | DefaultImportDefinition;

export interface SerializedBabelPluginOptions {
  options: TransformOptions;
}

export interface BabelPluginOptions {
  options: TransformOptions;
  context: SerializedContext;
}

export interface BabelPluginState<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context
> {
  log: LogFn;
  options: TOptions;
  context: TContext;
}

export type BabelPluginPass<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
> = PluginPass<TOptions> & TState;

export type BabelPlugin<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
> = PluginObject<BabelPluginPass<TOptions, TState>>;

export type BabelPluginTarget<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
  // eslint-disable-next-line ts/no-unsafe-function-type
> = BabelPlugin<TOptions, TState> | string | object | Function;

export type BabelPluginItem<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
> =
  | BabelPluginTarget<TOptions, TState>
  | [
      BabelPluginTarget<TOptions, TState>,
      Omit<TOptions, "options" | "context"> | undefined | null
    ]
  | [
      BabelPluginTarget<TOptions, TState>,
      Omit<TOptions, "options" | "context"> | undefined | null,
      CompilerOptions | undefined | null
    ];

export type ResolvedBabelPluginItem<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
> = [
  BabelPlugin<TOptions, TState> | BabelPluginTarget,
  TOptions,
  CompilerOptions | undefined | null
];
