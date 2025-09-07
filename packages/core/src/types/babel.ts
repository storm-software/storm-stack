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

import type {
  InputOptions,
  NodePath,
  PluginAPI,
  PluginObject,
  PluginPass
} from "@babel/core";
import type * as t from "@babel/types";
import { ErrorType } from "@storm-stack/core/runtime-types/shared/error";
import { CompilerOptions } from "./compiler";
import { LogFn } from "./config";
import { Context } from "./context";

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
  options: CompilerOptions;
}

export interface BabelPluginOptions {
  options: CompilerOptions;
}

export interface BabelPluginState<
  TOptions extends BabelPluginOptions = BabelPluginOptions
> {
  log: LogFn;
  options: TOptions;
}

export type BabelPluginPass<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState = unknown
> = PluginPass<TOptions> & TState;

export type BabelPlugin<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context,
  TState = unknown
> = ((
  context: TContext
) => (options: {
  name: string;
  log: LogFn;
  api: PluginAPI;
  options: TOptions;
  context: TContext;
  dirname: string;
}) => PluginObject<TOptions & BabelPluginPass<TOptions, TState>>) & {
  _name?: string;
};

export type BabelPluginTarget<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context,
  TState = unknown
> =
  | BabelPlugin<TOptions, TContext, TState>
  | PluginObject<BabelPluginPass<TOptions, TState>>
  | string
  | object;

export type BabelPluginItem<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState = unknown
> =
  | BabelPluginTarget<TOptions, Context, TState>
  | [
      BabelPluginTarget<TOptions, Context, TState>,
      Omit<TOptions, "options"> | undefined | null
    ]
  | [
      BabelPluginTarget<TOptions, Context, TState>,
      Omit<TOptions, "options"> | undefined | null,
      CompilerOptions | undefined | null
    ];

export type ResolvedBabelPluginItem<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context,
  TState = unknown
> = [
  (
    | BabelPlugin<TOptions, TContext, TState>
    | BabelPluginTarget<TOptions, TContext, TState>
  ),
  TOptions,
  CompilerOptions | undefined | null
];

export type BabelInputOptions = Omit<
  InputOptions & Required<Pick<InputOptions, "presets" | "plugins">>,
  "filename" | "root" | "sourceFileName" | "sourceMaps" | "inputSourceMap"
>;

/**
 * A non-local import specifier represents an import that is not defined within the current module.
 *
 * @example
 * ```typescript
 * import { bar as baz } from 'foo';
 * // { name: 'baz', module: 'foo', imported: 'bar' }
 * ```
 *
 * @remarks
 * It captures the details of an import statement, including the local name used in the module, the source module from which it is imported, and the original name of the export in the source module.
 */
export interface ImportSpecifier {
  name?: string;
  module: string;
  imported: string;
}
