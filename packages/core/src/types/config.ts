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

import { transformAsync } from "@babel/core";
import { AssetGlob } from "@storm-software/build-tools/types";
import type { LogLevelLabel } from "@storm-software/config-tools/types";
import { StormWorkspaceConfig } from "@storm-software/config/types";
import {
  ESBuildOptions as BaseESBuildOptions,
  MaybePromise
} from "@storm-software/esbuild/types";
import type { UnbuildOptions as BaseUnbuildOptions } from "@storm-software/unbuild/types";
import type { TypeDefinitionParameter } from "@stryke/types/configuration";
import { TsConfigJson } from "@stryke/types/tsconfig";
import { ConfigLayer, ResolvedConfig } from "c12";
import { BuildOptions as ExternalESBuildOptions } from "esbuild";
import { BuildOptions as ExternalUnbuildOptions } from "unbuild";
import { BabelPluginItem } from "./babel";
import { Context } from "./context";

export type LogFn = (type: LogLevelLabel, ...args: string[]) => void;

export type Template = (
  context: Context,
  ...args: any[]
) => MaybePromise<string>;

/**
 * The {@link StormWorkspaceConfig | configuration} object for an entire Storm Stack workspace
 */
export type WorkspaceConfig =
  | StormWorkspaceConfig
  | (Partial<StormWorkspaceConfig> &
      Pick<StormWorkspaceConfig, "workspaceRoot">);

/**
 * A configuration tuple for a Storm Stack plugin.
 */
export type PluginConfig<
  TProps extends Record<string, any> = Record<string, any>
> = [string, TProps | undefined];

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

export type BabelConfig = Parameters<typeof transformAsync>[1] & {
  /**
   * The Babel plugins to be used during the build process
   */
  plugins?: BabelPluginItem[];

  /**
   * The Babel presets to be used during the build process
   */
  presets?: BabelPluginItem[];
};

export interface OutputConfig {
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
   * The format of the output files
   *
   * @defaultValue "memory"
   */
  outputMode?: "memory" | "fs";

  /**
   * The path of the generated declaration file relative to the workspace root.
   *
   * @defaultValue "\{\{ projectRoot \}\}/storm.d.ts"
   */
  dts?: string | false;

  /**
   * A list of assets to copy to the output directory
   *
   * @remarks
   * The assets can be specified as a string (path to the asset) or as an object with a `glob` property (to match multiple files). The paths are relative to the project root directory.
   */
  assets?: Array<string | AssetGlob>;
}

export type UserConfig = Partial<Omit<WorkspaceConfig, "workspaceRoot">> & {
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
   * The root directory of the project's source code
   *
   * @defaultValue "\{root\}/src"
   */
  sourceRoot?: string;

  /**
   * A directory containing override templates used for generating the runtime files.
   *
   * @remarks
   * This option is useful for specifying custom templates for the generated runtime files.
   *
   * @defaultValue "\{root\}/templates"
   */
  templates?: string;

  /**
   * The type of project being built
   *
   * @defaultValue "application"
   */
  type?: "application" | "library";

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
   * Configuration for the output of the build process
   */
  output?: OutputConfig;

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
   * Options to override the behavior of the build process
   */
  esbuild?: ESBuildOptions;

  /**
   * Options to override the behavior of the unbuild process
   */
  unbuild?: UnbuildOptions;

  /**
   * The Babel configuration options to use for the build process
   */
  babel?: BabelConfig;
};

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

/**
 * The configuration provided while executing Storm Stack commands.
 */
export type InlineConfig = UserConfig & {
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
};

export type NewInlineConfig = InlineConfig & {
  /**
   * A string identifier for the Storm Stack command being executed
   */
  command: "new";

  /**
   * The package name (from the \`package.json\`) for the project that will be used in the \`new\` command to create a new project based on this configuration
   */
  packageName?: string;
};

export type CleanInlineConfig = InlineConfig & {
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
};

export type PrepareInlineConfig = InlineConfig & {
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
};

export type BuildInlineConfig = InlineConfig & {
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
};

export type LintInlineConfig = InlineConfig & {
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
};

export type DocsInlineConfig = InlineConfig & {
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
};
