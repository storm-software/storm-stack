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
  StormEnvInterface,
  StormSecretsInterface
} from "@storm-stack/core/runtime-types/shared/env";
import {
  ResolvedEntryTypeDefinition,
  ResolvedOptions
} from "@storm-stack/core/types";
import { Context, Reflection } from "@storm-stack/core/types/context";
import { PluginBaseOptions } from "@storm-stack/core/types/plugin";
import type { DotenvParseOutput } from "@stryke/env/types";
import {
  DotenvConfiguration,
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";

export type EnvType = "env" | "secrets";

export type EnvPluginOptions = Omit<DotenvConfiguration, "types"> &
  PluginBaseOptions & {
    /**
     * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#ConfigConfiguration"`.
     *
     * @remarks
     * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.config.types.variables` object in the project's `package.json` file.
     */
    types?: TypeDefinitionParameter;

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
  };

export type ResolvedEnvPluginOptions = Required<
  Pick<DotenvConfiguration, "additionalFiles">
> & {
  /**
   * The type definition for the expected env variable parameters
   *
   * @remarks
   * This value is parsed from the {@link EnvPluginOptions.types} option.
   */
  types: TypeDefinition;

  /**
   * The type definition for the expected env secret parameters
   *
   * @remarks
   * This value is parsed from the {@link EnvPluginOptions.secrets} option.
   */
  secrets: TypeDefinition;

  /**
   * Should the plugin inject the env variables in the source code with their values?
   *
   * @remarks
   * This value is the result of reflecting the {@link EnvPluginOptions.inject} option.
   */
  inject: EnvPluginOptions["inject"];

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
   * This value is the result of loading the .env configuration file found in the project root directory and merging it with the values provided at {@link EnvPluginOptions.values}
   */
  parsed: DotenvParseOutput;

  defaultConfig: string;
};

export interface EnvPluginResolvedOptions {
  env: ResolvedEnvPluginOptions;
}

export interface EnvPluginReflectionRecord {
  env: {
    types: {
      env: Reflection;
      secrets: Reflection;
    };

    env: Reflection<StormEnvInterface>;
    secrets: Reflection<StormSecretsInterface>;
    injected: Reflection;
  };
}

export type EnvPluginContext<
  TOptions extends
    ResolvedOptions<EnvPluginResolvedOptions> = ResolvedOptions<EnvPluginResolvedOptions>,
  TReflections extends EnvPluginReflectionRecord = EnvPluginReflectionRecord,
  TEntry extends ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> = Context<TOptions, TReflections, TEntry>;
