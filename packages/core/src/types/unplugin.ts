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
  UnpluginFactory,
  UnpluginInstance,
  UnpluginOptions
} from "unplugin";
import { Engine } from "../base/engine";
import { ResolvedOptions } from "./build";
import { BuildVariant } from "./config";

export type InferPluginOptions<
  TBuildVariant extends BuildVariant = BuildVariant
> = TBuildVariant extends "esbuild"
  ? UnpluginOptions & Required<Pick<UnpluginOptions, "esbuild">>
  : TBuildVariant extends "rspack"
    ? UnpluginOptions & Required<Pick<UnpluginOptions, "rspack">>
    : TBuildVariant extends "rollup"
      ? UnpluginOptions & Required<Pick<UnpluginOptions, "rollup">>
      : TBuildVariant extends "rolldown"
        ? UnpluginOptions & Required<Pick<UnpluginOptions, "rolldown">>
        : TBuildVariant extends "webpack"
          ? UnpluginOptions & Required<Pick<UnpluginOptions, "webpack">>
          : UnpluginOptions & Required<Pick<UnpluginOptions, "vite">>;

export interface UnpluginFactoryOptions<
  TOptions extends ResolvedOptions = ResolvedOptions
> {
  framework: TOptions["variant"];
  decorate?: (
    engine: Engine<TOptions>,
    plugin: InferPluginOptions<TOptions["variant"]>
  ) => InferPluginOptions<TOptions["variant"]>;
}

export type StormStackUnpluginFactory<
  TOptions extends ResolvedOptions = ResolvedOptions
> = UnpluginFactory<Partial<Omit<TOptions["userConfig"], "variant">>>;

export type StormStackUnpluginInstance<
  TOptions extends ResolvedOptions = ResolvedOptions
> = UnpluginInstance<Partial<Omit<TOptions["userConfig"], "variant">>>;
