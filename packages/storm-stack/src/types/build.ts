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
import type { StormWorkspaceConfig } from "@storm-software/config/types";
import type { EnvPaths } from "@stryke/env/get-env-paths";
import type { DotenvParseOutput } from "@stryke/env/types";
import type { MaybePromise } from "@stryke/types/base";
import type { TypeDefinition } from "@stryke/types/configuration";
import type { PackageJson } from "@stryke/types/package-json";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import type { Hookable } from "hookable";
import type { Jiti } from "jiti";
import type MagicString from "magic-string";
import type { SourceMap } from "magic-string";
import type { JSDoc, Project, ts, Type } from "ts-morph";
import type { InlinePreset, Unimport } from "unimport";
import type {
  AdapterProjectConfig,
  ApplicationProjectConfig,
  DotenvOptions,
  LibraryProjectConfig,
  ProjectConfig
} from "./config";

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
  env: string[];

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

export type ResolvedTsConfig = ts.ParsedCommandLine & {
  tsconfigJson: TsConfigJson;
};

export interface MetaInfo {
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

export interface ICompiler<TOptions extends Options = Options> {
  /**
   * Get the source file.
   *
   * @param id - The name of the file.
   * @param code - The source code.
   * @returns The source file.
   */
  getSourceFile: (id: string, code: string | MagicString) => SourceFile;

  /**
   * Get the result of the compiler.
   *
   * @param sourceFile - The source file.
   * @param transpiled - The transpiled source code.
   * @returns The result of the compiler.
   */
  getResult: (sourceFile: SourceFile, transpiled?: string) => CompilerResult;

  /**
   * Run the compiler.
   *
   * @param context - The context object
   * @param id - The name of the file to compile
   * @param code - The source code to compile
   * @returns The compiled source code
   */
  compile: (
    context: Context<TOptions>,
    id: string,
    code: string | MagicString
  ) => Promise<string>;
}

export type UnimportContext = Omit<Unimport, "injectImports"> & {
  dumpImports: () => Promise<void>;
  injectImports: (source: SourceFile) => Promise<SourceFile>;
};

export type InferProjectConfig<TConfig extends ProjectConfig = ProjectConfig> =
  TConfig["projectType"] extends "application"
    ? ApplicationProjectConfig & TConfig
    : TConfig["projectType"] extends "library"
      ? LibraryProjectConfig & TConfig
      : TConfig["projectType"] extends "adapter"
        ? AdapterProjectConfig & TConfig
        : never;

export type Context<
  TOptions extends Options = Options,
  TConfig extends InferProjectConfig<TOptions> = InferProjectConfig<TOptions>
> = TConfig &
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
    >
  > & {
    /**
     * The Storm workspace configuration
     */
    workspaceConfig: StormWorkspaceConfig;

    /**
     * The metadata information
     */
    meta: MetaInfo;

    /**
     * The metadata information currently written to disk
     */
    persistedMeta?: MetaInfo;

    /**
     * The project root directory
     */
    compiler: ICompiler<TOptions>;

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
    unimportPresets: InlinePreset[];

    /**
     * The parsed .env configuration object
     */
    resolvedDotenv: ResolvedDotenvOptions;

    /**
     * The entry points of the source code
     */
    resolvedEntry: ResolvedEntryTypeDefinition[];

    /**
     * The parsed TypeScript configuration
     */
    resolvedTsconfig: ResolvedTsConfig;

    /**
     * The project's package.json file content
     */
    packageJson: PackageJson;

    /**
     * The project's project.json file content
     */
    projectJson: Record<string, any>;

    /**
     * The `ts-morph` project instance
     */
    project: Project;

    /**
     * The .env variables used in the source code
     */
    vars: Record<string, ResolvedDotenvTypeDefinitionProperty>;

    /**
     * The Jiti module resolver
     */
    resolver: Jiti;

    /**
     * An object containing overridden options to be provided to the build invoked by the plugins (for example: esbuild, unbuild, vite, etc.)
     *
     * @remarks
     * Any values added here will have top priority over the resolved build options
     */
    override: Record<string, any>;

    /**
     * The resolved `unimport` context to be used by the compiler
     */
    unimport: UnimportContext;
  };

export interface EngineHookFunctions<TOptions extends Options = Options> {
  "init:context": (context: Context<TOptions>) => MaybePromise<void>;
  "init:installs": (context: Context<TOptions>) => MaybePromise<void>;
  "init:tsconfig": (context: Context<TOptions>) => MaybePromise<void>;
  "clean": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:types": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:runtime": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:entry": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:deploy": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:misc": (context: Context<TOptions>) => MaybePromise<void>;
  "build:transform": (
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:execute": (context: Context<TOptions>) => MaybePromise<void>;
  "finalize": (context: Context<TOptions>) => MaybePromise<void>;
}

export type EngineHooks<TOptions extends Options = Options> = Hookable<
  EngineHookFunctions<TOptions>
>;
