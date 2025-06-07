/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { LogLevelLabel } from "@storm-software/config-tools/types";
import type {
  DotenvConfiguration,
  TypeDefinitionParameter
} from "@stryke/types/configuration";

export type LogFn = (type: LogLevelLabel, ...args: string[]) => void;

export interface DotenvTypeDefinitionOptions {
  /**
   * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvConfiguration"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.variables` object in the project's `package.json` file.
   */
  variables?: TypeDefinitionParameter;

  /**
   * A path to the type definition for the expected env secret parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvSecrets"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.secrets` object in the project's `package.json` file.
   */
  secrets?: TypeDefinitionParameter;
}

export interface DotenvOptions extends DotenvConfiguration {
  /**
   * The type definitions for the environment variables
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types` object in the project's `package.json` file.
   */
  types?: DotenvTypeDefinitionOptions | string;

  /**
   * An additional prefix (or list of additional prefixes) to apply to the environment variables
   *
   * @remarks
   * By default, the plugin will use the `STORM_` prefix. This option is useful for avoiding conflicts with other environment variables.
   */
  prefix?: string | string[];

  /**
   * Should the plugin replace the env variables in the source code with their values?
   *
   * @remarks
   * This option is set to `true` when building an application project.
   *
   * @defaultValue false
   */
  replace?: boolean;
}

export type PluginConfig = [string, Record<string, any>];

export interface ProjectConfig {
  /**
   * The name of the project
   */
  name?: string;

  /**
   * A description of the project
   *
   * @remarks
   * If this option is not provided, the build process will try to use the \`description\` value from the `\package.json\` file.
   */
  description?: string;

  /**
   * The package name (from the \`package.json\`) for the project that will be used in the \`new\` command to create a new project based on this configuration
   */
  packageName?: string;

  /**
   * {@inheritdoc TypeScriptBuildResolvedOptions.projectRoot}
   */
  projectRoot: string;

  /**
   * The type of project being built
   *
   * @defaultValue "application"
   */
  projectType?: "application" | "library";

  /**
   * The platform to build the project for
   */
  platform?: "node" | "browser" | "neutral";

  /**
   * A list of resolvable paths to presets used during the build process
   */
  presets?: Array<string | PluginConfig>;

  /**
   * A list of resolvable paths to plugins used during the build process
   */
  plugins?: Array<string | PluginConfig>;

  /**
   * Options to control .env file processing
   */
  dotenv?: DotenvOptions;

  /**
   * The path of the generated declaration file relative to the workspace root.
   *
   * @defaultValue "\{\{ projectRoot \}\}/types/storm.d.ts"
   */
  dts?: string | false;

  /**
   * Should the Storm Stack CLI processes skip installing missing packages?
   *
   * @remarks
   * This option is useful for CI/CD environments where the installation of packages is handled by a different process.
   *
   * @defaultValue false
   */
  skipInstalls?: boolean;

  /**
   * Should the compiler processes skip any improvements that make use of cache?
   *
   * @defaultValue false
   */
  skipCache?: boolean;

  /**
   * Should linting be skipped for this project?
   *
   * @defaultValue false
   */
  skipLint?: boolean;

  /**
   * Should the esbuild processes skip the bundling of node_modules?
   *
   * @defaultValue false
   */
  skipNodeModulesBundle?: boolean;

  /**
   * A list of external packages to exclude from the bundled code
   */
  external?: string[];

  /**
   * A list of packages that should be included in the bundled code
   */
  noExternal?: string[];

  /**
   * The path (relative to the workspace root) to the file that will be used to generate the errors map
   *
   * @remarks
   * This file will be generated by the Babel plugin (if it doesn't already exist) and will contain list of error codes/messages that can be thrown by the application.
   *
   * @defaultValue "tools/errors/codes.json"
   */
  errorsFile?: string;
}

export type ApplicationProjectConfig = ProjectConfig & {
  /**
   * The entry point for the project
   *
   * @remarks
   * This is only used for applications. Libraries will have a separate entry point added for each file.
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

  /**
   * The type of project being built
   */
  projectType: "application";
};

export type NodeProjectConfig = ProjectConfig & {
  /**
   * The platform to build the project for
   *
   * @defaultValue "node"
   */
  platform: "node";
};

export type LibraryProjectConfig = ProjectConfig & {
  /**
   * The type of project being built
   */
  projectType: "library";
};
