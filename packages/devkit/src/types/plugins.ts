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

import { PrintTreeOptions } from "@alloy-js/core";
import { LogLevel } from "@storm-stack/core/runtime-types/shared/log";
import {
  ResolvedEntryTypeDefinition,
  ResolvedOptions,
  TsupResolvedOptions
} from "@storm-stack/core/types/build";
import { Context, ReflectionRecord } from "@storm-stack/core/types/context";
import { PluginBaseOptions } from "@storm-stack/core/types/plugin";

export interface LogPluginOptions extends PluginBaseOptions {
  logLevel?: LogLevel;
  namespace?: string;
}

export type ResolvedLogPluginOptions = Required<
  Pick<LogPluginOptions, "logLevel" | "namespace">
> &
  PluginBaseOptions;

export type LogPluginResolvedOptions<
  TOptions extends Record<string, any> = Record<string, any>
> = Record<TOptions["namespace"], TOptions & ResolvedLogPluginOptions>;

export type LogPluginContext<
  TOptions extends LogPluginResolvedOptions = LogPluginResolvedOptions,
  TReflections extends { [P in keyof unknown]: ReflectionRecord } = object,
  TEntry extends ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> = Context<ResolvedOptions<TOptions>, TReflections, TEntry>;

export interface StoragePluginOptions extends PluginBaseOptions {
  namespace: string;
}

export type StoragePluginResolvedOptions<
  TOptions extends StoragePluginOptions = StoragePluginOptions
> = Record<TOptions["namespace"], TOptions>;

export type StoragePluginContext<
  TOptions extends StoragePluginOptions = StoragePluginOptions,
  TReflections extends { [P in keyof unknown]: ReflectionRecord } = object,
  TEntry extends ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> = Context<
  ResolvedOptions<StoragePluginResolvedOptions<TOptions>>,
  TReflections,
  TEntry
>;

export interface PluginRenderOptions {
  /**
   * The files/directories that contain the plugin's templates for rendering.
   *
   * @remarks
   * This can be a single directory or an array of directories. The directories will be searched in order for template files.
   *
   * @defaultValue "\{sourceRoot\}/templates/**\/*.\{ts,tsx\}"
   */
  templates?: string | string[];
}

export interface PluginPluginOptions extends PluginBaseOptions {
  /**
   * The options applied to the [Alloy framework](https://alloy-framework.github.io/alloy/) for rendering templates.
   *
   * @remarks
   * If set to `false`, the Alloy processing step will be skipped. If set to `true`, the Alloy processing step will be enabled with its default settings.
   *
   * @defaultValue false
   */
  render?: PluginRenderOptions | boolean;
}

export interface ResolvedPluginRenderOptions {
  /**
   * The files that contain the plugin's templates for rendering.
   */
  templates: string[];

  /**
   * If true, generates Markdown output files.
   *
   * @defaultValue false
   */
  generatesMarkdown?: boolean;

  /** If true, generates JSON output files.
   *
   * @defaultValue false
   */
  generatesJson?: boolean;
}

export interface ResolvedPluginPluginOptions {
  render?: ResolvedPluginRenderOptions;
}

export type RenderPluginOptions = PluginBaseOptions & Partial<PrintTreeOptions>;

export type PluginPluginResolvedOptions<
  TOptions extends ResolvedPluginPluginOptions = ResolvedPluginPluginOptions
> = TsupResolvedOptions<{ plugin: TOptions }>;

export type PluginPluginContext<
  TOptions extends PluginPluginResolvedOptions = PluginPluginResolvedOptions,
  TReflections extends { [P in keyof unknown]: ReflectionRecord } = object,
  TEntry extends ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> = Context<TOptions, TReflections, TEntry>;
