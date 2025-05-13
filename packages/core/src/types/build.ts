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

import type { ReflectionClass } from "@deepkit/type";
import type { StormWorkspaceConfig } from "@storm-software/config/types";
import type { LogLevel } from "@storm-stack/types/shared/log";
import type { EnvPaths } from "@stryke/env/get-env-paths";
import type { DotenvParseOutput } from "@stryke/env/types";
import type { MaybePromise } from "@stryke/types/base";
import type {
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";
import type { PackageJson } from "@stryke/types/package-json";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import type { Hookable } from "hookable";
import type { Jiti } from "jiti";
import type MagicString from "magic-string";
import type { SourceMap } from "magic-string";
import type ts from "typescript";
import type { InlinePreset, Unimport } from "unimport";
import type {
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

export type InferProjectConfig<
  TProjectConfig extends ProjectConfig = ProjectConfig
> = TProjectConfig["projectType"] extends "application"
  ? ApplicationProjectConfig
  : TProjectConfig["projectType"] extends "library"
    ? LibraryProjectConfig
    : ProjectConfig;

/**
 * The format for providing the application entry point(s) to the build command
 */
export type Options<TProjectConfig extends ProjectConfig = ProjectConfig> = {
  /**
   * {@inheritdoc TypeScriptBuildResolvedOptions.outputPath}
   */
  outputPath?: string;

  /**
   * The entry point(s) for the application
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

  /**
   * The mode to use when compiling the source code
   *
   * @defaultValue "production"
   */
  mode?: "development" | "staging" | "production";

  /**
   * Should the plugin run silently (no console output)
   *
   * @defaultValue false
   */
  silent?: boolean;

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
} & InferProjectConfig<TProjectConfig>;

export interface ResolvedDotenvType<
  TReflection extends ReflectionClass<any> | undefined =
    | ReflectionClass<any>
    | undefined
> {
  /**
   * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvConfiguration"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.variables` object in the project's `package.json` file.
   */
  reflection: TReflection;

  /**
   * The type definition for the expected env configuration parameters
   *
   * @remarks
   * This value is parsed from the {@link DotenvOptions.types} option.
   */
  typeDefinition?: TypeDefinition;
}

export interface ResolvedDotenvTypes {
  /**
   * The type definition for the expected env configuration parameters
   *
   * @remarks
   * This value is parsed from the {@link DotenvOptions.types} option.
   */
  variables: ResolvedDotenvType<ReflectionClass<any>>;

  /**
   * The type definition for the expected env secret parameters
   *
   * @remarks
   * This value is parsed from the {@link DotenvOptions.types} option.
   */
  secrets?: ResolvedDotenvType;
}

export type ResolvedDotenvOptions = Required<
  Pick<DotenvOptions, "additionalFiles">
> & {
  /**
   * The path to the type definition for the expected env configuration parameters
   *
   * @remarks
   * This value is parsed from the {@link DotenvOptions.types} option.
   */
  types: ResolvedDotenvTypes;

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

  /**
   * An optional name to use in the package export during the build process
   */
  output?: string;
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

export interface CompilerOptions<TOptions extends Options = Options> {
  /**
   * Transform the source file before other transformations.
   *
   * @param context - The context object
   * @param source - The source file
   * @returns The transformed source file
   */
  onPreTransform?: (
    context: Context<TOptions>,
    source: SourceFile
  ) => MaybePromise<void>;

  /**
   * Transform the source file before transpilation.
   *
   * @param context - The context object
   * @param sourceFile - The source file
   * @returns The transformed source file
   */
  onTransform?: (
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) => MaybePromise<void>;

  /**
   * Transform the source file after transpilation.
   *
   * @param context - The context object
   * @param source - The source file
   * @returns The transformed source file
   */
  onPostTransform?: (
    context: Context<TOptions>,
    source: SourceFile
  ) => MaybePromise<void>;
}

export interface TranspileOptions<TOptions extends Options = Options>
  extends CompilerOptions<TOptions> {
  /**
   * Skip all transformations.
   *
   * @defaultValue false
   */
  skipTransform?: boolean;

  /**
   * Skip the .env environment variable transformation.
   *
   * @defaultValue false
   */
  skipEnvTransform?: boolean;

  /**
   * Skip the error codes formatting transformation.
   *
   * @defaultValue false
   */
  skipErrorsTransform?: boolean;
}

export interface CompileOptions<TOptions extends Options = Options>
  extends TranspileOptions<TOptions> {
  /**
   * Skip the cache.
   *
   * @defaultValue false
   */
  skipCache?: boolean;
}

export interface ICompiler<TOptions extends Options = Options> {
  /**
   * Get the source file.
   *
   * @param id - The name of the file.
   * @param code - The source code.
   * @returns The source file.
   */
  getSourceFile: (id: string, code?: string | MagicString) => SourceFile;

  /**
   * Get the result of the compiler.
   *
   * @param sourceFile - The source file.
   * @param transpiled - The transpiled source code.
   * @returns The result of the compiler.
   */
  getResult: (sourceFile: SourceFile, transpiled?: string) => CompilerResult;

  /**
   * Transpile the module.
   *
   * @param context - The context object
   * @param id - The name of the file to transpile
   * @param code - The source code to transpile
   * @param options - The transpile options
   * @returns The transpiled module.
   */
  transpile: (
    context: Context<TOptions>,
    id: string,
    code: string | MagicString,
    options?: CompileOptions<TOptions>
  ) => Promise<string>;

  /**
   * Run the compiler.
   *
   * @param context - The context object
   * @param id - The name of the file to compile
   * @param code - The source code to compile
   * @param options - The compiler options
   * @returns The compiled source code
   */
  compile: (
    context: Context<TOptions>,
    id: string,
    code: string | MagicString,
    options?: CompileOptions<TOptions>
  ) => Promise<string>;
}

export type UnimportContext = Omit<Unimport, "injectImports"> & {
  dumpImports: () => Promise<void>;
  injectImports: (source: SourceFile) => Promise<SourceFile>;
};

export type InferOptions<TOptions extends Options = Options> =
  TOptions["projectType"] extends "application"
    ? TOptions & Options<ApplicationProjectConfig>
    : TOptions["projectType"] extends "library"
      ? TOptions & Options<LibraryProjectConfig>
      : never;

export type ResolvedOptions<TOptions extends Options = Options> = TOptions &
  Required<
    Pick<
      TOptions,
      "name" | "tsconfig" | "mode" | "outputPath" | "platform" | "errorsFile"
    >
  > & {
    /**
     *
     */
    original: TOptions;
  };

export interface LogRuntimeConfig {
  /**
   * The name of the log sink to be used by the runtime.
   */
  name: string;

  /**
   * The lowest log level for the driver to accept.
   */
  logLevel: LogLevel;

  /**
   * The import statement to be used by the runtime.
   */
  import?: string;
}

export interface StorageRuntimeConfig {
  /**
   * The storage id to be used by the runtime.
   */
  storageId: string;

  /**
   * The import statement to be used by the runtime.
   */
  import: string;

  /**
   * The name of the storage to be used by the runtime.
   */
  name: string;
}

export interface RuntimeConfig {
  logs: LogRuntimeConfig[];
  storage: StorageRuntimeConfig[];
  init: string[];
}

export interface Context<TOptions extends Options = Options> {
  /**
   * An object containing the options provided to Storm Stack
   */
  options: ResolvedOptions<TOptions>;

  /**
   * The Storm workspace configuration
   */
  workspaceConfig:
    | StormWorkspaceConfig
    | (Partial<StormWorkspaceConfig> &
        Pick<StormWorkspaceConfig, "workspaceRoot">);

  /**
   * The Storm Stack artifacts directory
   */
  artifactsDir: string;

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
   * The imports to insert into the source code
   */
  unimportPresets: InlinePreset[];

  /**
   * The parsed .env configuration object
   */
  dotenv: ResolvedDotenvOptions;

  /**
   * The entry points of the source code
   */
  entry: ResolvedEntryTypeDefinition[];

  /**
   * The installations required by the project
   */
  installs: Record<string, "dependency" | "devDependency">;

  /**
   * The runtime configuration
   */
  runtime: RuntimeConfig;

  /**
   * The parsed TypeScript configuration
   */
  tsconfig: ResolvedTsConfig;

  /**
   * The project's package.json file content
   */
  packageJson: PackageJson;

  /**
   * The project's project.json file content
   */
  projectJson?: Record<string, any>;

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
}

export interface EngineHookFunctions<TOptions extends Options = Options> {
  // Init - Hooks used during the initialization of the Storm Stack engine
  "init:begin": (context: Context<TOptions>) => MaybePromise<void>;
  "init:context": (context: Context<TOptions>) => MaybePromise<void>;
  "init:installs": (context: Context<TOptions>) => MaybePromise<void>;
  "init:tsconfig": (context: Context<TOptions>) => MaybePromise<void>;
  "init:unimport": (context: Context<TOptions>) => MaybePromise<void>;
  "init:dotenv": (context: Context<TOptions>) => MaybePromise<void>;
  "init:entry": (context: Context<TOptions>) => MaybePromise<void>;
  "init:complete": (context: Context<TOptions>) => MaybePromise<void>;

  // Clean - Hooks used during the cleaning of the Storm Stack project
  "clean:begin": (context: Context<TOptions>) => MaybePromise<void>;
  "clean:artifacts": (context: Context<TOptions>) => MaybePromise<void>;
  "clean:output": (context: Context<TOptions>) => MaybePromise<void>;
  "clean:docs": (context: Context<TOptions>) => MaybePromise<void>;
  "clean:complete": (context: Context<TOptions>) => MaybePromise<void>;

  // Prepare - Hooks used during the preparation of the Storm Stack artifacts
  "prepare:begin": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:directories": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:types": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:runtime": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:reflections": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:entry": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:deploy": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:misc": (context: Context<TOptions>) => MaybePromise<void>;
  "prepare:complete": (context: Context<TOptions>) => MaybePromise<void>;

  // Lint - Hooks used during the linting process
  "lint:begin": (context: Context<TOptions>) => MaybePromise<void>;
  "lint:eslint": (context: Context<TOptions>) => MaybePromise<void>;
  "lint:complete": (context: Context<TOptions>) => MaybePromise<void>;

  // Build - Hooks used during the build process of the Storm Stack project
  "build:begin": (context: Context<TOptions>) => MaybePromise<void>;
  "build:pre-transform": (
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:transform": (
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:post-transform": (
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:library": (context: Context<TOptions>) => MaybePromise<void>;
  "build:application": (context: Context<TOptions>) => MaybePromise<void>;
  "build:complete": (context: Context<TOptions>) => MaybePromise<void>;

  // Docs - Hooks used during the documentation generation process
  "docs:begin": (context: Context<TOptions>) => MaybePromise<void>;
  "docs:dotenv": (context: Context<TOptions>) => MaybePromise<void>;
  "docs:api-reference": (context: Context<TOptions>) => MaybePromise<void>;
  "docs:complete": (context: Context<TOptions>) => MaybePromise<void>;

  // Finalize - Hooks used during the finalization of the Storm Stack project
  "finalize:begin": (context: Context<TOptions>) => MaybePromise<void>;
  "finalize:complete": (context: Context<TOptions>) => MaybePromise<void>;
}

export type EngineHooks<TOptions extends Options = Options> = Hookable<
  EngineHookFunctions<TOptions>
>;
