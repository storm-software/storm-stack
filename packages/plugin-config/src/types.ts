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
  InlineRuntimeType,
  ReflectionClass
} from "@storm-stack/core/deepkit/type";
import { StormConfigInterface } from "@storm-stack/core/runtime-types/esm/shared";
import {
  ResolvedEntryTypeDefinition,
  ResolvedOptions
} from "@storm-stack/core/types";
import {
  BabelPluginOptions,
  BabelPluginPass,
  BabelPluginState
} from "@storm-stack/core/types/babel";
import { Context, Reflection } from "@storm-stack/core/types/context";
import { PluginBaseOptions } from "@storm-stack/core/types/plugin";
import type { DotenvParseOutput } from "@stryke/env/types";
import {
  DotenvConfiguration,
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";

export type ConfigPluginOptions = Omit<DotenvConfiguration, "types"> &
  PluginBaseOptions & {
    /**
     * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#ConfigConfiguration"`.
     *
     * @remarks
     * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.config.types.variables` object in the project's `package.json` file.
     */
    types?:
      | TypeDefinitionParameter
      | InlineRuntimeType<ReflectionClass<StormConfigInterface>>;

    /**
     * A path to the type definition for the expected env secret parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#ConfigSecrets"`.
     *
     * @remarks
     * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.config.types.secrets` object in the project's `package.json` file.
     */
    secrets?: TypeDefinitionParameter;

    /**
     * An additional prefix (or list of additional prefixes) to apply to the environment variables
     *
     * @remarks
     * By default, the plugin will use the `STORM_` prefix. This option is useful for avoiding conflicts with other environment variables.
     */
    prefix?: string | string[];

    /**
     * Should the plugin inject the env variables in the source code with their values?
     *
     * @remarks
     * This option is set to `true` when building an application project.
     *
     * @defaultValue false
     */
    inject?: boolean;

    /**
     * The environment config template string to provide as the default parameter of `createConfig` in `storm:config`
     *
     * @defaultValue `process.env`
     */
    environmentConfig?: string;
  };

export type ResolvedConfigPluginOptions = Required<
  Pick<DotenvConfiguration, "additionalFiles">
> & {
  /**
   * The type definition for the expected env variable parameters
   *
   * @remarks
   * This value is parsed from the {@link ConfigPluginOptions.types} option.
   */
  types:
    | TypeDefinition
    | InlineRuntimeType<ReflectionClass<StormConfigInterface>>;

  /**
   * The type definition for the expected env secret parameters
   *
   * @remarks
   * This value is parsed from the {@link ConfigPluginOptions.secrets} option.
   */
  secrets?: TypeDefinition;

  /**
   * Should the plugin inject the env variables in the source code with their values?
   *
   * @remarks
   * This value is the result of reflecting the {@link ConfigPluginOptions.inject} option.
   */
  inject: ConfigPluginOptions["inject"];

  /**
   * The prefix used for environment variables
   *
   * @remarks
   * This value is used to filter environment variables that are loaded from the .env file and the process environment.
   */
  prefix: string[];

  /**
   * The parsed .env configuration object
   *
   * @remarks
   * This value is the result of loading the .env configuration file found in the project root directory and merging it with the values provided at {@link ConfigPluginOptions.values}
   */
  parsed: DotenvParseOutput;
};

export interface ConfigPluginResolvedOptions {
  config: ResolvedConfigPluginOptions;
}

export interface ConfigPluginReflectionRecord {
  config: {
    types: {
      params: Reflection;
      secrets?: Reflection;
    };

    params: Reflection;
    secrets?: Reflection;
    injected: Reflection;
  };
}

export type ConfigPluginContext<
  TOptions extends
    ResolvedOptions<ConfigPluginResolvedOptions> = ResolvedOptions<ConfigPluginResolvedOptions>,
  TReflections extends
    ConfigPluginReflectionRecord = ConfigPluginReflectionRecord,
  TEntry extends ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> = Context<TOptions, TReflections, TEntry>;

export type ConfigBabelPluginState = BabelPluginState<BabelPluginOptions>;

export type ConfigBabelPluginPass = BabelPluginPass<
  BabelPluginOptions,
  ConfigBabelPluginState
>;
