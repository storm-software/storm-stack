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

import type { ReflectionClass } from "@deepkit/type";
import { LogLevel } from "@storm-stack/types/log";
import type { EnvPaths } from "@stryke/env/get-env-paths";
import type { DotenvParseOutput } from "@stryke/env/types";
import type { MaybePromise, NonUndefined } from "@stryke/types/base";
import type { TypeDefinition } from "@stryke/types/configuration";
import type { PackageJson } from "@stryke/types/package-json";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import type { Hookable } from "hookable";
import { Worker as JestWorker } from "jest-worker";
import type { Jiti } from "jiti";
import type MagicString from "magic-string";
import type { SourceMap } from "magic-string";
import { Buffer } from "node:buffer";
import { Stats } from "node:fs";
import type ts from "typescript";
import type { InlinePreset, Unimport } from "unimport";
import Vinyl from "vinyl";
import type {
  DotenvOptions,
  InlineConfig,
  ResolvedUserConfig,
  WorkspaceConfig
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

export interface ResolvedDotenvType<
  TReflection extends ReflectionClass<any> | undefined =
    | ReflectionClass<any>
    | undefined
> {
  /**
   * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvConfiguration"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.config` object in the project's `package.json` file.
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
  config: ResolvedDotenvType<ReflectionClass<any>>;

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
   * An additional prefix (or list of additional prefixes) to apply to the environment variables
   *
   * @remarks
   * By default, the plugin will use the `STORM_` prefix. This option is useful for avoiding conflicts with other environment variables.
   */
  prefix: string[];

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

export type ParsedTypeScriptConfig = ts.ParsedCommandLine & {
  tsconfigJson: TsConfigJson;
  tsconfigFilePath: string;
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

  /**
   * A hash that represents the path to the project root directory
   */
  projectRootHash: string;
}

export interface CompilerOptions {
  /**
   * Transform the source file before other transformations.
   *
   * @param context - The context object
   * @param source - The source file
   * @returns The transformed source file
   */
  onPreTransform?: (
    context: Context,
    source: SourceFile
  ) => MaybePromise<SourceFile>;

  /**
   * Transform the source file before transpilation.
   *
   * @param context - The context object
   * @param sourceFile - The source file
   * @returns The transformed source file
   */
  onTransform?: (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<SourceFile>;

  /**
   * Transform the source file after transpilation.
   *
   * @param context - The context object
   * @param source - The source file
   * @returns The transformed source file
   */
  onPostTransform?: (
    context: Context,
    source: SourceFile
  ) => MaybePromise<SourceFile>;
}

export interface TranspileOptions extends CompilerOptions {
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
  skipDotenvTransform?: boolean;

  /**
   * Skip the error codes formatting transformation.
   *
   * @defaultValue false
   */
  skipErrorsTransform?: boolean;

  /**
   * Skip the unimport transformation.
   *
   * @defaultValue false
   */
  skipUnimportTransform?: boolean;
}

export interface CompileOptions extends TranspileOptions {
  /**
   * Skip the cache.
   *
   * @defaultValue false
   */
  skipCache?: boolean;
}

export interface ICompiler {
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
   * Transform the module.
   *
   * @param context - The context object
   * @param id - The name of the file to transpile
   * @param code - The source code to transpile
   * @param options - The transpile options
   * @returns The transpiled module.
   */
  transform: (
    context: Context,
    id: string,
    code: string | MagicString,
    options?: TranspileOptions
  ) => Promise<string>;

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
    context: Context,
    id: string,
    code: string | MagicString,
    options?: CompileOptions
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
    context: Context,
    id: string,
    code: string | MagicString,
    options?: CompileOptions
  ) => Promise<string>;
}

export type UnimportContext = Omit<Unimport, "injectImports"> & {
  dumpImports: () => Promise<void>;
  injectImports: (source: SourceFile) => Promise<SourceFile>;
};

/**
 * The resolved options for the Storm Stack project configuration.
 */
export type ResolvedOptions<TInlineConfig extends InlineConfig = InlineConfig> =
  WorkspaceConfig &
    Omit<TInlineConfig, "root" | "type"> &
    Required<
      Pick<
        TInlineConfig,
        | "command"
        | "name"
        | "mode"
        | "environment"
        | "platform"
        | "errorsFile"
        | "tsconfig"
        | "esbuild"
        | "unbuild"
      >
    > & {
      /**
       * The configuration options that were provided inline to the Storm Stack CLI.
       */
      inlineConfig: TInlineConfig;

      /**
       * The original configuration options that were provided by the user to the Storm Stack process.
       */
      userConfig: ResolvedUserConfig;

      /**
       * The root directory of the project.
       */
      projectRoot: NonUndefined<TInlineConfig["root"]>;

      /**
       * The type of project being built.
       */
      projectType: NonUndefined<TInlineConfig["type"]>;

      /**
       * A map of all the alias paths used in the project.
       */
      alias: Record<string, string>;

      /**
       * A flag indicating whether the build is for server-side rendering (SSR).
       */
      isSsrBuild: boolean;

      /**
       * A flag indicating whether the build is for a preview environment.
       */
      isPreview: boolean;
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
  namespace: string;

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

export type WorkerProcess<TExposedMethods extends ReadonlyArray<string>> = {
  [K in TExposedMethods[number]]: (data: any) => Promise<any>;
} & {
  close: () => void;
  end: () => ReturnType<JestWorker["end"]>;
};

export interface VirtualFileOptions {
  /**
   * A checksum for the file. This is a read-only property that is set when the file is created.
   *
   * @remarks
   * This property is used to ensure the integrity of the file's contents and is not meant to be modified after creation.
   */
  checksum: string;

  /**
   * The unique identifier for the file. This is a read-only property that is set when the file is created.
   *
   * @remarks
   * This property is used to uniquely identify the file in the virtual file system and is not meant to be modified after creation.
   */
  id: string;

  /**
   * The current working directory of the file. Defaults to the `workspaceRoot` value from the {@link Context.workspaceConfig} object.
   */
  cwd?: string | undefined;

  /**
   * Used for relative paths. Typically where a glob starts. Defaults to the {@link cwd} value.
   */
  base?: string | undefined;

  /**
   * Full path to the file.
   */
  path?: string | undefined;

  /**
   * Stores the path history. If {@link path} and {@link history} are both passed, {@link path} is appended to {@link history}. All {@link history} paths are normalized by the {@link Vinyl.path} setter. Defaults to [ {@link path} ] if {@link path} is passed.
   *
   * @defaultValue `[]`
   */
  history?: string[] | undefined;

  /**
   * The result of an {@link stats} call. This is how you mark the file as a directory or symbolic link.
   *
   * @remarks
   * See `isDirectory()`, `isSymbolic()` and {@link Stats} for more information.
   *
   * @see https://nodejs.org/api/fs.html#fs_class_fs_stats
   */
  stat?: Stats | undefined;

  /**
   * The virtual file's contents
   *
   * @defaultValue null
   */
  contents?: Buffer | NodeJS.ReadableStream | null | undefined;

  /**
   * Any custom option properties will be directly assigned to the new Vinyl object.
   */
  [customOption: string]: any;
}

export const __vfs__ = Symbol("virtual-file-system");

export type VirtualFile = Vinyl & {
  /**
   * The unique identifier for the virtual file.
   * @remarks
   * This property is read-only and is set when the file is created.
   */
  name: string;

  /**
   * The checksum of the file, used to verify its integrity.
   * @remarks
   * This property is read-only and is set when the file is created.
   */
  checksum: string;
};

export interface VirtualRuntimeFile extends VirtualFile {
  /**
   * A flag indicating whether the file is a runtime file.
   *
   * @remarks
   * This property is used to differentiate between regular files and runtime files in the virtual file system.
   */
  isRuntime: true;
}

export interface IVirtualFileSystem {
  /**
   * Adds a file to the virtual file system.
   *
   * @param options - The options for the virtual file, excluding the checksum.
   */
  set: (options: Omit<VirtualFileOptions, "checksum">) => boolean;

  /**
   * Retrieves the content of a file from the virtual file system or the filesystem.
   *
   * @param path - The path to the file in the virtual file system.
   * @returns The content of the file as a string, or undefined if the file does not exist.
   */
  getSafe: (path: string) => string | undefined;

  /**
   * Retrieves the content of a file from the virtual file system.
   *
   * @param path - The path to the file in the virtual file system.
   * @returns The content of the file as a string.
   * @throws An error if the file does not exist in the virtual file system.
   */
  get: (path: string) => string;

  /**
   * Checks if a file exists in the virtual file system or the filesystem.
   *
   * @param path - The path to check in the virtual file system.
   * @returns A boolean indicating whether the file exists in the virtual file system or the filesystem.
   */
  has: (path: string) => boolean;

  /**
   * Adds one or multiple files to the virtual file system.
   *
   * @param param - A string or array of strings of file paths to add to the virtual file system.
   */
  add: (param: string | string[] | Map<string, string>) => void;

  /**
   * Returns an array of all file paths in the virtual file system.
   *
   * @returns An array of strings representing the paths of all files in the virtual file system.
   */
  keys: () => string[];

  /**
   * Returns an array of all file objects in the virtual and physical file system.
   *
   * @returns An array of Vinyl objects representing the files in the virtual and physical file system.
   */
  values: () => VirtualFile[];

  /**
   * Returns an array of entries in the virtual file system, where each entry is a tuple containing the file path and the corresponding Vinyl object.
   *
   * @returns An array of tuples, where each tuple contains a string (the file path) and a Vinyl object (the file).
   */
  entries: () => [string, VirtualFile][];

  /**
   * Returns a Map of all file paths and their corresponding Vinyl objects in the virtual file system.
   *
   * @returns A Map where the keys are file paths (strings) and the values are Vinyl objects representing the files.
   */
  getAll: () => Map<string, VirtualFile>;

  /**
   * Returns a Map of all runtime modules in the virtual file system.
   */
  getRuntime: () => VirtualRuntimeFile[];

  /**
   * Returns a Map of all runtime modules in the virtual file system.
   */
  addRuntime: (id: string, contents: string) => VirtualRuntimeFile;

  /**
   * A reference to the underlying Map object that stores the virtual files.
   */
  [__vfs__]: Map<string, VirtualFile>;
}

export interface Context<
  TInlineConfig extends InlineConfig = InlineConfig,
  TResolvedEntryTypeDefinition extends
    ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> {
  /**
   * The Storm workspace configuration
   */
  workspaceConfig: WorkspaceConfig;

  /**
   * An object containing the options provided to Storm Stack
   */
  options: ResolvedOptions<TInlineConfig>;

  /**
   * The relative path to the Storm Stack workspace root directory
   */
  relativeToWorkspaceRoot: string;

  /**
   * The Storm Stack artifacts directory
   */
  artifactsPath: string;

  /**
   * The path to the Storm Stack runtime directory
   */
  runtimePath: string;

  /**
   * The path to a directory where the data buffers (used by the build processes) are stored
   */
  dataPath: string;

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
  compiler: ICompiler;

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
  entry: TResolvedEntryTypeDefinition[];

  /**
   * The installations required by the project
   */
  installs: Record<string, "dependency" | "devDependency">;

  /**
   * The parsed TypeScript configuration
   */
  tsconfig: ParsedTypeScriptConfig;

  /**
   * The project's package.json file content
   */
  packageJson: PackageJson;

  /**
   * The project's project.json file content
   */
  projectJson?: Record<string, any>;

  /**
   * The message ports used to communicate with the worker processes
   */
  workers: {
    configReflection: WorkerProcess<["add", "clear"]>;
    errorLookup: WorkerProcess<["find"]>;
  };

  /**
   * The virtual file system manager used during the build process to reference generated runtime files
   */
  vfs: IVirtualFileSystem;

  /**
   * The Jiti module resolver
   */
  resolver: Jiti;

  /**
   * The runtime configuration for the Storm Stack project
   */
  runtime: RuntimeConfig;

  /**
   * The resolved `unimport` context to be used by the compiler
   */
  unimport: UnimportContext;

  /**
   * The list of additional runtime files to be included in the build
   *
   * @remarks
   * This option is used to include additional files that are not part of the source code but are required by the runtime.
   */
  additionalRuntimeFiles?: string[];
}

export interface EngineHookFunctions {
  // New - Hooks used during the creation of a new project
  "new:begin": (context: Context) => MaybePromise<void>;
  "new:library": (context: Context) => MaybePromise<void>;
  "new:application": (context: Context) => MaybePromise<void>;
  "new:complete": (context: Context) => MaybePromise<void>;

  // Init - Hooks used during the initialization of the Storm Stack engine
  "init:begin": (context: Context) => MaybePromise<void>;
  "init:context": (context: Context) => MaybePromise<void>;
  "init:options": (context: Context) => MaybePromise<void>;
  "init:installs": (context: Context) => MaybePromise<void>;
  "init:tsconfig": (context: Context) => MaybePromise<void>;
  "init:unimport": (context: Context) => MaybePromise<void>;
  "init:dotenv": (context: Context) => MaybePromise<void>;
  "init:workers": (context: Context) => MaybePromise<void>;
  "init:entry": (context: Context) => MaybePromise<void>;
  "init:complete": (context: Context) => MaybePromise<void>;

  // Clean - Hooks used during the cleaning of the Storm Stack project
  "clean:begin": (context: Context) => MaybePromise<void>;
  "clean:types": (context: Context) => MaybePromise<void>;
  "clean:artifacts": (context: Context) => MaybePromise<void>;
  "clean:output": (context: Context) => MaybePromise<void>;
  "clean:docs": (context: Context) => MaybePromise<void>;
  "clean:complete": (context: Context) => MaybePromise<void>;

  // Prepare - Hooks used during the preparation of the Storm Stack artifacts
  "prepare:begin": (context: Context) => MaybePromise<void>;
  "prepare:directories": (context: Context) => MaybePromise<void>;
  "prepare:config": (context: Context) => MaybePromise<void>;
  "prepare:types": (context: Context) => MaybePromise<void>;
  "prepare:dotenv": (context: Context) => MaybePromise<void>;
  "prepare:runtime": (context: Context) => MaybePromise<void>;
  "prepare:entry": (context: Context) => MaybePromise<void>;
  "prepare:reflections": (context: Context) => MaybePromise<void>;
  "prepare:deploy": (context: Context) => MaybePromise<void>;
  "prepare:misc": (context: Context) => MaybePromise<void>;
  "prepare:complete": (context: Context) => MaybePromise<void>;

  // Lint - Hooks used during the linting process
  "lint:begin": (context: Context) => MaybePromise<void>;
  "lint:eslint": (context: Context) => MaybePromise<void>;
  "lint:complete": (context: Context) => MaybePromise<void>;

  // Build - Hooks used during the build process of the Storm Stack project
  "build:begin": (context: Context) => MaybePromise<void>;
  "build:pre-transform": (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:transform": (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:post-transform": (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:library": (context: Context) => MaybePromise<void>;
  "build:application": (context: Context) => MaybePromise<void>;
  "build:complete": (context: Context) => MaybePromise<void>;

  // Docs - Hooks used during the documentation generation process
  "docs:begin": (context: Context) => MaybePromise<void>;
  "docs:dotenv": (context: Context) => MaybePromise<void>;
  "docs:api-reference": (context: Context) => MaybePromise<void>;
  "docs:complete": (context: Context) => MaybePromise<void>;

  // Finalize - Hooks used during the finalization of the Storm Stack project
  "finalize:begin": (context: Context) => MaybePromise<void>;
  "finalize:complete": (context: Context) => MaybePromise<void>;
}

export type EngineHooks = Hookable<EngineHookFunctions>;
