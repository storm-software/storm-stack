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
import type { Configuration as ExternalRspackOptions } from "@rspack/core";
import { AssetGlob } from "@storm-software/build-tools/types";
import type { LogLevelLabel } from "@storm-software/config-tools/types";
import { StormWorkspaceConfig } from "@storm-software/config/types";
import {
  ESBuildOptions as ExternalTsupOptions,
  MaybePromise
} from "@storm-software/esbuild/types";
import type { UnbuildOptions as ExternalUnbuildOptions } from "@storm-software/unbuild/types";
import type { TypeDefinitionParameter } from "@stryke/types/configuration";
import { ConfigLayer, ResolvedConfig } from "c12";
import type { BuildOptions as ExternalESBuildOptions } from "esbuild";
import type { RolldownOptions as ExternalRolldownOptions } from "rolldown";
import type { RollupOptions as ExternalRollupOptions } from "rollup";
import type { UnpluginContextMeta } from "unplugin";
import type {
  InlineConfig as ExternalViteInlineConfig,
  UserConfig as ExternalViteUserConfig
} from "vite";
import type { Configuration as ExternalWebpackOptions } from "webpack";
import { BabelPluginItem } from "./babel";
import { Context } from "./context";
import { PluginInterface } from "./plugin";
import { TSConfig } from "./tsconfig";

export type LogFn = (type: LogLevelLabel, ...args: string[]) => void;

export type Template = (
  context: Context,
  ...args: any[]
) => MaybePromise<string>;

/**
 * The {@link StormWorkspaceConfig | configuration} object for an entire Storm Stack workspace
 */
export type WorkspaceConfig = Partial<StormWorkspaceConfig> &
  Required<Pick<StormWorkspaceConfig, "workspaceRoot">>;

/**
 * A configuration tuple for a Storm Stack plugin.
 */
export type PluginConfigTuple<
  TProps extends Record<string, any> = Record<string, any>
> = [string, TProps | undefined];

/**
 * A configuration object for a Storm Stack plugin.
 */
export interface PluginConfigObject<
  TProps extends Record<string, any> = Record<string, any>
> {
  plugin: string;
  props?: TProps;
}

/**
 * A configuration tuple for a Storm Stack plugin.
 */
export type PluginConfig<
  TProps extends Record<string, any> = Record<string, any>
> =
  | PluginConfigTuple<TProps>
  | PluginConfigObject<TProps>
  | PluginInterface<Context, TProps>;

export type ESBuildConfig = Omit<
  ExternalESBuildOptions,
  | "entryPoints"
  | "sourceRoot"
  | "platform"
  | "outdir"
  | "env"
  | "assets"
  | "external"
  | "tsconfig"
  | "tsconfigRaw"
>;
export type ESBuildOptions = ExternalESBuildOptions;

export type ViteConfig = Omit<
  ExternalViteUserConfig,
  "entry" | "entryPoints" | "tsconfig" | "tsconfigRaw"
>;
export type ViteOptions = ExternalViteInlineConfig;

export type WebpackConfig = Omit<
  ExternalWebpackOptions,
  "name" | "entry" | "entryPoints" | "tsconfig" | "tsconfigRaw"
>;
export type WebpackOptions = ExternalWebpackOptions;

export type RspackConfig = Omit<
  ExternalRspackOptions,
  "name" | "entry" | "entryPoints" | "tsconfig" | "tsconfigRaw"
>;
export type RspackOptions = ExternalRspackOptions;

export type RollupConfig = ExternalRollupOptions;
export type RollupOptions = ExternalRollupOptions;

export type RolldownConfig = ExternalRolldownOptions;
export type RolldownOptions = ExternalRolldownOptions;

export type TsupConfig = Partial<
  Omit<
    ExternalTsupOptions,
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
    | "entryPoints"
    | "external"
    | "noExternal"
    | "skipNodeModulesBundle"
  >
>;

export type StandaloneApplicationBuildConfig = TsupConfig;

export type TsupOptions = ExternalTsupOptions;
export type StandaloneApplicationBuildOptions = TsupOptions;

export type UnbuildConfig = Partial<
  Omit<
    ExternalUnbuildOptions,
    | "tsconfig"
    | "tsconfigRaw"
    | "assets"
    | "outputPath"
    | "mode"
    | "platform"
    | "projectRoot"
    | "env"
    | "entry"
    | "entryPoints"
  >
>;

export type StandaloneLibraryBuildConfig = UnbuildConfig;

export type UnbuildOptions = ExternalUnbuildOptions;
export type StandaloneLibraryBuildOptions = UnbuildOptions;

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
   * The path of the generated runtime declaration file relative to the workspace root.
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

export type ProjectType = "application" | "library";

export type UnpluginBuildVariant =
  | "webpack"
  | "rspack"
  | "esbuild"
  | "rollup"
  | "rolldown"
  | "vite";

export type BuildVariant =
  | UnpluginBuildVariant
  | "standalone"
  | "tsup"
  | "unbuild";

export type InferBuildConfig<
  TBuildVariant extends BuildVariant = BuildVariant,
  TProjectType extends ProjectType = ProjectType
> = TBuildVariant extends "webpack"
  ? WebpackOptions
  : TBuildVariant extends "rspack"
    ? RspackOptions
    : TBuildVariant extends "esbuild"
      ? ESBuildConfig
      : TBuildVariant extends "rollup"
        ? RollupOptions
        : TBuildVariant extends "rolldown"
          ? RolldownOptions
          : TBuildVariant extends "vite"
            ? ViteConfig
            : TBuildVariant extends "tsup"
              ? TsupConfig
              : TBuildVariant extends "unbuild"
                ? UnbuildConfig
                : TProjectType extends "library"
                  ? StandaloneLibraryBuildConfig
                  : StandaloneApplicationBuildConfig;

export type InferBuildOptionsOverride<
  TBuildVariant extends BuildVariant = BuildVariant,
  TProjectType extends ProjectType = ProjectType
> = TBuildVariant extends "webpack"
  ? Partial<WebpackOptions>
  : TBuildVariant extends "rspack"
    ? Partial<RspackOptions>
    : TBuildVariant extends "esbuild"
      ? Partial<ESBuildOptions>
      : TBuildVariant extends "rollup"
        ? Partial<RollupOptions>
        : TBuildVariant extends "rolldown"
          ? Partial<RolldownOptions>
          : TBuildVariant extends "vite"
            ? Partial<ViteOptions>
            : TBuildVariant extends "tsup"
              ? Partial<TsupOptions>
              : TBuildVariant extends "unbuild"
                ? Partial<UnbuildOptions>
                : TProjectType extends "library"
                  ? Partial<StandaloneLibraryBuildOptions>
                  : Partial<StandaloneApplicationBuildOptions>;

export type InferBuildOptions<
  TBuildVariant extends BuildVariant = BuildVariant,
  TProjectType extends ProjectType = ProjectType
> = TBuildVariant extends "webpack"
  ? WebpackOptions
  : TBuildVariant extends "rspack"
    ? RspackOptions
    : TBuildVariant extends "esbuild"
      ? ESBuildOptions
      : TBuildVariant extends "rollup"
        ? RollupOptions
        : TBuildVariant extends "rolldown"
          ? RolldownOptions
          : TBuildVariant extends "vite"
            ? ViteOptions
            : TBuildVariant extends "tsup"
              ? TsupOptions
              : TBuildVariant extends "unbuild"
                ? UnbuildOptions
                : TProjectType extends "library"
                  ? StandaloneLibraryBuildOptions
                  : StandaloneApplicationBuildOptions;

export interface CommonUserConfig {
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
   * The type of project being built
   *
   * @defaultValue "application"
   */
  type?: ProjectType;

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
   * The log level to use for the Storm Stack processes.
   *
   * @defaultValue "info"
   */
  logLevel?: LogLevelLabel | null;

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
   * The raw {@link TSConfig} object to be used by the compiler. This object will be merged with the `tsconfig.json` file.
   *
   * @see https://www.typescriptlang.org/tsconfig
   *
   * @remarks
   * If populated, this option takes higher priority than `tsconfig`
   */
  tsconfigRaw?: TSConfig;

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
   * The Babel configuration options to use for the build process
   */
  babel?: BabelConfig;
}

export interface WebpackUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "webpack";

  /**
   * Options to to provide to the build process
   */
  build?: WebpackConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<WebpackOptions>;
}

export interface RspackUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "rspack";

  /**
   * Options to to provide to the build process
   */
  build?: RspackConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<RspackOptions>;
}

export interface RollupUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "rollup";

  /**
   * Options to to provide to the build process
   */
  build?: RollupConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<RollupOptions>;
}

export interface RolldownUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "rolldown";

  /**
   * Options to to provide to the build process
   */
  build?: RolldownConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<RolldownOptions>;
}

export interface ViteUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "vite";

  /**
   * Options to to provide to the build process
   */
  build?: ViteConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<ViteOptions>;
}

export interface ESBuildUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "esbuild";

  /**
   * Options to to provide to the build process
   */
  build?: ESBuildConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<ESBuildOptions>;
}

export interface UnbuildUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "unbuild";

  /**
   * Options to to provide to the build process
   */
  build?: UnbuildConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<UnbuildOptions>;
}

export interface TsupUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "tsup";

  /**
   * Options to to provide to the build process
   */
  build?: TsupConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<TsupOptions>;
}

export interface StandaloneCommonUserConfig extends CommonUserConfig {
  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "standalone";
}

export interface StandaloneLibraryUserConfig
  extends StandaloneCommonUserConfig {
  /**
   * The type of project being built
   */
  type: "library";

  /**
   * Options to to provide to the build process
   */
  build?: StandaloneLibraryBuildConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<StandaloneLibraryBuildOptions>;
}

export interface StandaloneApplicationUserConfig
  extends StandaloneCommonUserConfig {
  /**
   * The type of project being built
   */
  type: "application";

  /**
   * Options to to provide to the build process
   */
  build?: StandaloneApplicationBuildConfig;

  /**
   * A set of options similar to {@link UserConfig.build}, except they will not be merged with the default/plugin provided options.
   *
   * @remarks
   * The options provided here will take precedence over any other options that might be set.
   */
  override?: Partial<StandaloneApplicationBuildOptions>;
}

export type UserConfig =
  | WebpackUserConfig
  | RspackUserConfig
  | ViteUserConfig
  | ESBuildUserConfig
  | UnbuildUserConfig
  | TsupUserConfig
  | RolldownUserConfig
  | RollupUserConfig
  | StandaloneApplicationUserConfig
  | StandaloneLibraryUserConfig;

export type ResolvedUserConfig<TUserConfig extends UserConfig = UserConfig> =
  TUserConfig &
    ResolvedConfig<TUserConfig> & {
      /**
       * The path to the user configuration file, if it exists.
       *
       * @remarks
       * This is typically the `storm.json`, `storm.config.js`, or `storm.config.ts` file in the project root.
       */
      configFile?: ConfigLayer<TUserConfig>["configFile"];
    };

export type StormStackCommand =
  | "new"
  | "prepare"
  | "build"
  | "lint"
  | "docs"
  | "clean";

/**
 * The configuration provided while executing Storm Stack commands.
 */
export type InlineConfig<TUserConfig extends UserConfig = UserConfig> =
  Partial<TUserConfig> &
    Partial<Omit<WorkspaceConfig, "logLevel">> & {
      /**
       * A string identifier for the Storm Stack command being executed
       */
      command: StormStackCommand;

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

export type PrepareInlineConfig<TUserConfig extends UserConfig = UserConfig> =
  InlineConfig<TUserConfig> & {
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

export type BuildInlineConfig<TUserConfig extends UserConfig = UserConfig> =
  InlineConfig<TUserConfig> & {
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

    /**
     * Should linting be skipped for this project?
     *
     * @defaultValue false
     */
    skipLint?: boolean;
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

export type UnpluginBuildInlineConfig<
  TUserConfig extends UserConfig = UserConfig
> = BuildInlineConfig<TUserConfig> & {
  /**
   * The meta information for the unplugin context
   */
  unplugin: UnpluginContextMeta;
};
