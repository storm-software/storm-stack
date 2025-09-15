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

import { ViteResolvedOptions } from "@storm-stack/core/types";
import { LogFn } from "@storm-stack/core/types/config";
import { Context } from "@storm-stack/core/types/context";
import type { Plugin as ExternalPlugin } from "vite";

export type VitePlugin = ExternalPlugin | ExternalPlugin[];

export interface VitePluginBuilderParams<
  TOptions extends Record<string, any> = Record<string, any>,
  TContext extends Context<ViteResolvedOptions> = Context<ViteResolvedOptions>
> {
  name: string;
  log: LogFn;
  options: TOptions;
  context: TContext;
}

export type VitePluginBuilderReturn<
  TOptions extends Record<string, any> = Record<string, any>
> = (options: TOptions) => VitePlugin;

export type VitePluginBuilder<
  TOptions extends Record<string, any> = Record<string, any>,
  TContext extends Context<ViteResolvedOptions> = Context<ViteResolvedOptions>
> = (
  params: VitePluginBuilderParams<TOptions, TContext>
) => VitePluginBuilderReturn<TOptions>;
