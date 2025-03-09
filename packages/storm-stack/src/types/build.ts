/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import type { Platform } from "@storm-software/build-tools/types";
import type { StormConfig } from "@storm-software/config/types";
import type { EnvPaths } from "@stryke/env/get-env-paths";
import type { DotenvParseOutput } from "@stryke/env/types";
import type { MaybePromise } from "@stryke/types/utility-types/base";
import type { TypeDefinition } from "@stryke/types/utility-types/configuration";
import type { TsConfigJson } from "@stryke/types/utility-types/tsconfig";
import type { Hookable } from "hookable";
import type MagicString from "magic-string";
import type { SourceMap } from "magic-string";
import type { JSDoc, ts, Type } from "ts-morph";
import type { InlinePreset, Unimport } from "unimport";
import type { DotenvOptions, ProjectConfig } from "./config";

/**
 * The result of the compiler
 */
export type CompilerResult =
  | {
      code: string;
      map: SourceMap;
    }
  | undefined;

/**
 * The format for providing source code to the compiler
 */
export interface SourceFile {
  /**
   * The name of the file to be compiled
   */
  id: string;

  /**
   * The source code to be compiled
   */
  code: MagicString;

  /**
   * The environment variables used in the source code
   */
  env: Record<string, SourceFileEnv>;

  /**
   * The transpiled source code
   */
  result?: CompilerResult;
}

/**
 * The format for providing the application entry point(s) to the build command
 */
export type Options = Partial<ProjectConfig> & {
  /**
   * {@inheritdoc TypeScriptBuildResolvedOptions.projectRoot}
   */
  projectRoot: string;

  /**
   * {@inheritdoc TypeScriptBuildResolvedOptions.outputPath}
   */
  outputPath?: string;

  /**
   * The platform to target when compiling the source code
   *
   * @remarks
   * If the `"browser"` or `"neutral"` platforms are selected, environment variables containing secrets will not be embedded into the compiled source code.
   */
  platform?: "node" | "browser" | "neutral";

  /**
   * The mode to use when compiling the source code
   *
   * @defaultValue "production"
   */
  mode?: "development" | "staging" | "production";

  /**
   * The format to use when compiling the source code
   */
  format?: "esm" | "cjs";

  /**
   * Should the plugin run silently (no console output)
   *
   * @defaultValue false
   */
  silent?: boolean;

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
   * A list of external packages to exclude from the bundled code
   */
  external?: string[];

  /**
   * A list of packages that should be included in the bundled code
   */
  noExternal?: string[];

  /**
   * Should the compiler minify the output
   *
   * @remarks
   * This value is set to `true` by default when the {@link Options.mode} is set to `"production"`
   *
   * @defaultValue false
   */
  minify?: boolean;

  /**
   * The path to the file to save the generated imports
   *
   * @defaultValue "\{projectRoot\}/.storm/import-dump.json"
   */
  importDump?: string | boolean;

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
};

export interface ResolvedDotenvTypeDefinitionProperty {
  jsDocs?: JSDoc[];
  defaultValue?: any;
  description?: string;
  text: string;
  isOptional: boolean;
  type?: Type<ts.Type>;
}

export type ResolvedDotenvTypeDefinition = Omit<TypeDefinition, "file"> &
  Partial<Pick<TypeDefinition, "file">> & {
    properties: Record<string, ResolvedDotenvTypeDefinitionProperty>;
  };

export interface SourceFileEnv {
  name: string;
  description?: string;
  value: any;
  defaultValue?: string;
  type: Omit<ResolvedDotenvTypeDefinitionProperty, "jsDocs">;
}

export interface ResolvedDotenvTypeDefinitions {
  /**
   * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvConfiguration"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.variables` object in the project's `package.json` file.
   */
  variables?: ResolvedDotenvTypeDefinition;

  /**
   * A path to the type definition for the expected env secret parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvSecrets"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.secrets` object in the project's `package.json` file.
   */
  secrets?: ResolvedDotenvTypeDefinition;
}

export type ResolvedDotenvOptions = Required<
  Pick<DotenvOptions, "additionalFiles" | "docgen">
> & {
  /**
   * The path to the type definition for the expected env configuration parameters
   *
   * @remarks
   * This value is parsed from the {@link DotenvOptions.types} option.
   */
  types?: ResolvedDotenvTypeDefinitions;

  /**
   * Should the plugin replace the env variables in the source code with their values?
   *
   * @remarks
   * This option is set to `true` when building an application project.
   *
   * @defaultValue false
   */
  replace: boolean;

  /**
   * The parsed .env configuration object
   *
   * @remarks
   * This value is the result of loading the .env configuration file found in the project root directory and merging it with the values provided at {@link DotenvOptions.values}
   */
  values: DotenvParseOutput;
};

export interface ResolvedEntryTypeDefinition extends TypeDefinition {
  /**
   * The user provided entry point in the source code
   */
  input: TypeDefinition;
}

export interface BuildInfo {
  /**
   * The checksum generated from the resolved options
   */
  checksum: string;

  /**
   * The build id
   */
  buildId: string;

  /**
   * The release id
   */
  releaseId: string;

  /**
   * The build timestamp
   */
  timestamp: number;
}

export type InferResolvedOptions<TOptions extends Options = Options> =
  TOptions &
    Required<
      Pick<
        TOptions,
        | "platform"
        | "mode"
        | "silent"
        | "outputPath"
        | "skipInstalls"
        | "skipCache"
        | "minify"
        | "importDump"
        | "tsconfig"
        | "projectType"
      >
    > & {
      /**
       * The Storm workspace configuration
       */
      workspaceConfig: StormConfig;

      /**
       * The build information
       */
      buildInfo: BuildInfo;

      /**
       * The Storm Stack environment paths
       */
      envPaths: EnvPaths;

      /**
       * The platform configuration to use when building the project
       */
      platform: Platform;

      /**
       * The directory to generate files in the prepare step
       *
       * @defaultValue "\{projectRoot\}/.storm"
       */
      artifactsDir: string;

      /**
       * The directory where the artifact runtime files are stored
       */
      runtimeDir: string;

      /**
       * The directory where the artifact types are stored
       */
      typesDir: string;

      /**
       * The imports to insert into the source code
       */
      presets: InlinePreset[];

      /**
       * The parsed .env configuration object
       */
      resolvedDotenv: ResolvedDotenvOptions;

      /**
       * The entry points of the source code
       */
      resolvedEntry: ResolvedEntryTypeDefinition[];

      /**
       * An object containing overridden options to be provided to the build invoked by the plugins (for example: esbuild, unbuild, vite, etc.)
       *
       * @remarks
       * Any values added here will have top priority over the resolved build options
       */
      override: Record<string, any>;
    };

export type ResolvedOptions = InferResolvedOptions<Options>;

export type UnimportContext = Omit<Unimport, "injectImports"> & {
  dumpImports: () => Promise<void>;
  injectImports: (source: SourceFile) => Promise<SourceFile>;
};

export interface EngineHookFunctions<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> {
  "init:options": (options: TResolvedOptions) => MaybePromise<void>;
  "init:installs": (options: TResolvedOptions) => MaybePromise<void>;
  "init:tsconfig": (options: TResolvedOptions) => MaybePromise<void>;
  "prepare:types": (options: TResolvedOptions) => MaybePromise<void>;
  "prepare:runtime": (options: TResolvedOptions) => MaybePromise<void>;
  "prepare:entry": (options: TResolvedOptions) => MaybePromise<void>;
  "build:run": (options: TResolvedOptions) => MaybePromise<void>;
  "finalize:run": (options: TResolvedOptions) => MaybePromise<void>;
}

export type EngineHooks<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> = Hookable<EngineHookFunctions<TOptions, TResolvedOptions>>;
