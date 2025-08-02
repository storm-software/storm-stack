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
  BabelPluginOptions,
  BabelPluginState
} from "@storm-stack/core/types/babel";
import { Context } from "@storm-stack/core/types/context";
import { PluginBaseConfig } from "@storm-stack/core/types/plugin";
import type { DotenvParseOutput } from "@stryke/env/types";
import {
  DotenvConfiguration,
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";

export interface DotenvTypeDefinitionParameters {
  /**
   * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvConfiguration"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.variables` object in the project's `package.json` file.
   */
  config?: TypeDefinitionParameter;

  /**
   * A path to the type definition for the expected env secret parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvSecrets"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.secrets` object in the project's `package.json` file.
   */
  secrets?: TypeDefinitionParameter;
}

export type DotenvPluginConfig = DotenvConfiguration &
  PluginBaseConfig & {
    /**
     * The type definitions for the environment variables
     *
     * @remarks
     * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types` object in the project's `package.json` file.
     */
    types?: DotenvTypeDefinitionParameters | string;

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

export interface ReflectedDotenvTypeDefinitions {
  /**
   * The type definition for the expected env configuration parameters
   *
   * @remarks
   * This value is parsed from the {@link DotenvPluginConfig.types} option.
   */
  config: TypeDefinition;

  /**
   * The type definition for the expected env secret parameters
   *
   * @remarks
   * This value is parsed from the {@link DotenvPluginConfig.types} option.
   */
  secrets?: TypeDefinition;
}

export type ResolvedDotenvOptions = Required<
  Pick<DotenvConfiguration, "additionalFiles">
> & {
  /**
   * The type definitions for the environment variables
   *
   * @remarks
   * This value is the result of reflecting the type definitions provided in the {@link DotenvPluginConfig.types} option.
   */
  types: ReflectedDotenvTypeDefinitions;

  /**
   * Should the plugin inject the env variables in the source code with their values?
   *
   * @remarks
   * This value is the result of reflecting the {@link DotenvPluginConfig.inject} option.
   */
  inject: DotenvPluginConfig["inject"];

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
   * This value is the result of loading the .env configuration file found in the project root directory and merging it with the values provided at {@link DotenvPluginConfig.values}
   */
  values: DotenvParseOutput;
};

export interface DotenvPluginContextOptions {
  dotenv: ResolvedDotenvOptions;
}

export type DotenvPluginContext = Context<DotenvPluginContextOptions>;

export type DotenvBabelPluginState = BabelPluginState<
  BabelPluginOptions,
  DotenvPluginContext
>;
