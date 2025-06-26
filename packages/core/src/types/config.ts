/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { AssetGlob } from "@storm-software/build-tools/types";
import type { LogLevelLabel } from "@storm-software/config-tools/types";
import { StormWorkspaceConfig } from "@storm-software/config/types";
import { ESBuildOptions as BaseESBuildOptions } from "@storm-software/esbuild/types";
import type { UnbuildOptions as BaseUnbuildOptions } from "@storm-software/unbuild/types";
import type {
  DotenvConfiguration,
  TypeDefinitionParameter
} from "@stryke/types/configuration";
import { TsConfigJson } from "@stryke/types/tsconfig";
import { ConfigLayer, ResolvedConfig } from "c12";
import { BuildOptions as ExternalESBuildOptions } from "esbuild";
import { BuildOptions as ExternalUnbuildOptions } from "unbuild";

export type LogFn = (type: LogLevelLabel, ...args: string[]) => void;

export interface DotenvTypeDefinitionOptions {
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

export type ESBuildOverrideOptions = ExternalESBuildOptions &
  BaseESBuildOptions;

export type ESBuildOptions = Partial<
  Omit<
    BaseESBuildOptions,
    | "userOptions"
    | "tsconfig"
    | "tsconfigRaw"
    | "assets"
    | "outputPath"
    | "mode"
    | "platform"
    | "projectRoot"
    | "env"
    | "entry"
    | "external"
    | "noExternal"
    | "skipNodeModulesBundle"
  >
> & {
  override?: Partial<ESBuildOverrideOptions>;
};

export type UnbuildOverrideOptions = ExternalUnbuildOptions &
  BaseUnbuildOptions;

export type UnbuildOptions = Partial<
  Omit<
    BaseUnbuildOptions,
    | "tsconfig"
    | "tsconfigRaw"
    | "assets"
    | "outputPath"
    | "mode"
    | "platform"
    | "projectRoot"
    | "env"
    | "entry"
  >
> & {
  override?: Partial<UnbuildOverrideOptions>;
};

export interface UserConfig {
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
   * The root directory of the project
   */
  root?: string;

  /**
   * The type of project being built
   *
   * @defaultValue "application"
   */
  type?: "application" | "library";

  /**
   * The platform to build the project for
   *
   * @defaultValue "neutral"
   */
  platform?: "node" | "browser" | "neutral";

  /**
   * Explicitly set a mode to run in. This mode will be used at various points throughout the Storm Stack processes, such as when compiling the source code.
   *
   * @defaultValue "production"
   */
  mode?: "development" | "staging" | "production";

  /**
   * The environment name for which the project is being built.
   *
   * @defaultValue "shared"
   */
  environment?: string;

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
   * @defaultValue "\{\{ projectRoot \}\}/storm.d.ts"
   */
  dts?: string | false;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

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
   * The path to output the final compiled files to
   *
   * @remarks
   * If a value is not provided, Storm Stack will attempt to:
   * 1. Use the `outDir` value in the `tsconfig.json` file.
   * 2. Use the `dist` directory in the project root directory.
   */
  outputPath?: string;

  /**
   * The log level to use for the Storm Stack processes.
   *
   * @defaultValue "info"
   */
  logLevel?: LogLevelLabel;

  /**
   * A custom logger function to use for logging messages
   */
  customLogger?: LogFn;

  /**
   * The path to the tsconfig file to be used by the compiler
   *
   * @remarks
   * If a value is not provided, the plugin will attempt to find the `tsconfig.json` file in the project root directory. The parsed tsconfig compiler options will be merged with the {@link Options.tsconfigRaw} value (if provided).
   *
   * @defaultValue "\{projectRoot\}/tsconfig.json"
   */
  tsconfig?: string;

  /**
   * The [raw tsconfig object](https://www.typescriptlang.org/tsconfig) to be used by the compiler. This object will be merged with the `tsconfig.json` file.
   *
   * @remarks
   * If populated, this option takes higher priority than `tsconfig`
   */
  tsconfigRaw?: TsConfigJson;

  /**
   * A list of modules that should always be bundled, even if they are external dependencies.
   */
  noExternal?: (string | RegExp)[];

  /**
   * A list of modules that should not be bundled, even if they are external dependencies.
   *
   * @remarks
   * This option is useful for excluding specific modules from the bundle, such as Node.js built-in modules or other libraries that should not be bundled.
   */
  external?: (string | RegExp)[];

  /**
   * Should the Storm Stack CLI processes skip bundling the `node_modules` directory?
   */
  skipNodeModulesBundle?: boolean;

  /**
   * A list of assets to copy to the output directory
   *
   * @remarks
   * The assets can be specified as a string (path to the asset) or as an object with a `glob` property (to match multiple files). The paths are relative to the project root directory.
   */
  assets?: Array<string | AssetGlob>;

  /**
   * The path (relative to the workspace root) to the file that will be used to generate the errors map
   *
   * @remarks
   * This file will be generated by the Babel plugin (if it doesn't already exist) and will contain list of error codes/messages that can be thrown by the application.
   *
   * @defaultValue "tools/errors/codes.json"
   */
  errorsFile?: string;

  /**
   * Options to override the behavior of the build process
   */
  esbuild?: ESBuildOptions;

  /**
   * Options to override the behavior of the unbuild process
   */
  unbuild?: UnbuildOptions;
}

export type ResolvedUserConfig = UserConfig &
  ResolvedConfig<UserConfig> & {
    /**
     * The path to the user configuration file, if it exists.
     *
     * @remarks
     * This is typically the `storm.json`, `storm.config.js`, or `storm.config.ts` file in the project root.
     */
    configFile?: ConfigLayer<UserConfig>["configFile"];
  };

export interface InlineConfig extends UserConfig {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "new" | "prepare" | "build" | "lint" | "docs" | "clean";

  /**
   * The package name (from the \`package.json\`) for the project that will be used in the \`new\` command to create a new project based on this configuration
   */
  packageName?: string;

  /**
   * The path to the tsconfig file to be used by the compiler
   *
   * @remarks
   * If a value is not provided, the plugin will attempt to find the `tsconfig.json` file in the project root directory. The parsed tsconfig compiler options will be merged with the {@link Options.tsconfigRaw} value (if provided).
   *
   * @defaultValue "\{root\}/tsconfig.json"
   */
  tsconfig?: string;

  /**
   * The environment name for which the project is being built.
   *
   * @defaultValue "shared"
   */
  environment?: string;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];
}

export interface NewInlineConfig extends InlineConfig {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "new";

  /**
   * The package name (from the \`package.json\`) for the project that will be used in the \`new\` command to create a new project based on this configuration
   */
  packageName?: string;
}

export interface CleanInlineConfig extends InlineConfig {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "clean";

  /**
   * The path to the tsconfig file to be used by the compiler
   *
   * @remarks
   * If a value is not provided, the plugin will attempt to find the `tsconfig.json` file in the project root directory. The parsed tsconfig compiler options will be merged with the {@link Options.tsconfigRaw} value (if provided).
   *
   * @defaultValue "\{root\}/tsconfig.json"
   */
  tsconfig?: string;

  /**
   * The environment name for which the project is being built.
   *
   * @defaultValue "shared"
   */
  environment?: string;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];
}

export interface PrepareInlineConfig extends InlineConfig {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "prepare";

  /**
   * The path to the tsconfig file to be used by the compiler
   *
   * @remarks
   * If a value is not provided, the plugin will attempt to find the `tsconfig.json` file in the project root directory. The parsed tsconfig compiler options will be merged with the {@link Options.tsconfigRaw} value (if provided).
   *
   * @defaultValue "\{root\}/tsconfig.json"
   */
  tsconfig?: string;

  /**
   * The environment name for which the project is being built.
   *
   * @defaultValue "shared"
   */
  environment?: string;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

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
   * Should the Storm Stack CLI process clean up the project artifacts prior to running the `storm prepare` command?
   *
   * @defaultValue false
   */
  clean?: boolean;
}

export interface BuildInlineConfig extends InlineConfig {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "build";

  /**
   * The path to the tsconfig file to be used by the compiler
   *
   * @remarks
   * If a value is not provided, the plugin will attempt to find the `tsconfig.json` file in the project root directory. The parsed tsconfig compiler options will be merged with the {@link Options.tsconfigRaw} value (if provided).
   *
   * @defaultValue "\{root\}/tsconfig.json"
   */
  tsconfig?: string;

  /**
   * The environment name for which the project is being built.
   *
   * @defaultValue "shared"
   */
  environment?: string;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

  /**
   * The output path for the compiled build artifacts
   */
  outputPath?: string;

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
   * Should the Storm Stack CLI process clean up the project artifacts prior to running the `prepare` command?
   *
   * @defaultValue false
   */
  clean?: boolean;
}

export interface LintInlineConfig extends InlineConfig {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "lint";

  /**
   * The path to the tsconfig file to be used by the compiler
   *
   * @remarks
   * If a value is not provided, the plugin will attempt to find the `tsconfig.json` file in the project root directory. The parsed tsconfig compiler options will be merged with the {@link Options.tsconfigRaw} value (if provided).
   *
   * @defaultValue "\{root\}/tsconfig.json"
   */
  tsconfig?: string;

  /**
   * The environment name for which the project is being built.
   *
   * @defaultValue "shared"
   */
  environment?: string;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

  /**
   * Should the compiler processes skip any improvements that make use of cache?
   *
   * @defaultValue false
   */
  skipCache?: boolean;
}

export interface DocsInlineConfig extends InlineConfig {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "docs";

  /**
   * The path to the tsconfig file to be used by the compiler
   *
   * @remarks
   * If a value is not provided, the plugin will attempt to find the `tsconfig.json` file in the project root directory. The parsed tsconfig compiler options will be merged with the {@link Options.tsconfigRaw} value (if provided).
   *
   * @defaultValue "\{root\}/tsconfig.json"
   */
  tsconfig?: string;

  /**
   * The environment name for which the project is being built.
   */
  environment?: string;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

  /**
   * The output path for the compiled build artifacts
   */
  outputPath?: string;

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
   * Should the Storm Stack CLI process clean up the project artifacts prior to running the `prepare` command?
   *
   * @defaultValue false
   */
  clean?: boolean;
}

/**
 * The {@link StormWorkspaceConfig | configuration} object for an entire Storm Stack workspace
 */
export type WorkspaceConfig =
  | StormWorkspaceConfig
  | (Partial<StormWorkspaceConfig> &
      Pick<StormWorkspaceConfig, "workspaceRoot">);
