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

import { LogLevel } from "@storm-stack/core/runtime-types/shared/log";
import {
  ResolvedEntryTypeDefinition,
  ResolvedOptions
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
