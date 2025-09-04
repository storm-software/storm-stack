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

import { ReflectionClass } from "@deepkit/type";
import { SerializedTypes as CapnpSerializedTypes } from "@storm-stack/core/schemas/reflection";
import { LogLevel } from "@storm-stack/types/shared/log";
import { EnvPaths } from "@stryke/env/get-env-paths";
import { PackageJson } from "@stryke/types/package-json";
import { Worker as JestWorker } from "jest-worker";
import { Jiti } from "jiti";
import { DirectoryJSON } from "memfs";
import { Unimport } from "unimport";
import { ResolvedEntryTypeDefinition, ResolvedOptions } from "./build";
import { CompilerInterface, SourceFile } from "./compiler";
import type { LogFn } from "./config";
import { PluginPackageDependencies } from "./plugin";
import { ParsedTypeScriptConfig } from "./tsconfig";
import { VirtualFileSystemInterface } from "./vfs";

export interface LogRuntimeConfig {
  /**
   * The name of the log adapter to be used by the runtime.
   */
  name: string;

  /**
   * The lowest log level for the driver to accept.
   */
  logLevel: LogLevel;

  /**
   * The file name of the log adapter module.
   *
   * @remarks
   * This is used to determine the file name of the log adapter module in the runtime.
   */
  fileName: string;
}

export interface StorageRuntimeConfig {
  /**
   * The name of the storage to be used by the runtime.
   */
  name: string;

  /**
   * The storage id to be used by the runtime.
   */
  namespace: string;

  /**
   * The file name of the storage module.
   *
   * @remarks
   * This is used to determine the file name of the storage module in the runtime.
   */
  fileName: string;
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

  /**
   * A mapping of runtime ids to their corresponding file paths
   */
  runtimeIdMap: Record<string, string>;

  /**
   * A mapping of virtual file paths to their corresponding file contents
   */
  virtualFiles: Record<string, string | null>;
}

export type UnimportContext = Omit<Unimport, "injectImports"> & {
  dumpImports: () => Promise<void>;
  injectImports: (source: SourceFile) => Promise<SourceFile>;
  refreshRuntimeImports: () => Promise<void>;
};

export type Reflection<T extends Record<string, any> = Record<string, any>> =
  ReflectionClass<T> & {
    dataBuffer?: ArrayBuffer;
    messageRoot?: CapnpSerializedTypes;
  };
export type ReflectionRecord<
  T extends Record<string, any> = Record<string, any>
> = Record<string, Reflection<T>>;

export interface ContextReflectionRecord<
  T extends Record<string, any> = Record<string, any>
> extends Record<string, Reflection<T> | ContextReflectionRecord<T>> {}

export interface Context<
  TOptions extends ResolvedOptions = ResolvedOptions,
  TReflections extends { [P in keyof unknown]: ReflectionRecord } = {
    [P in keyof unknown]: ReflectionRecord;
  },
  TEntry extends ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> {
  /**
   * An object containing the options provided to Storm Stack
   */
  options: TOptions;

  /**
   * A logging function for the Storm Stack engine
   */
  log: LogFn;

  /**
   * The reflections found and used by Storm Stack plugins
   *
   * @remarks
   * These reflections are used by plugins to store data that will be passed around the Storm Stack processes. Please note: these values are not persisted to disk by default.
   */
  reflections: TReflections;

  /**
   * The metadata information
   */
  meta: MetaInfo;

  /**
   * The metadata information currently written to disk
   */
  persistedMeta?: MetaInfo;

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
   * The path to the Storm Stack entry modules directory
   */
  entryPath: string;

  /**
   * The path to the Storm Stack TypeScript declaration files directory
   */
  dtsPath: string;

  /**
   * The path to the generated Storm Stack TypeScript declaration files file
   */
  runtimeDtsFilePath: string;

  /**
   * The path to a directory where the reflection data buffers (used by the build processes) are stored
   */
  dataPath: string;

  /**
   * The path to a directory where the project cache (used by the build processes) is stored
   */
  cachePath: string;

  /**
   * The runtime file generation template files discovered
   */
  templates: string[];

  /**
   * The Storm Stack environment paths
   */
  envPaths: EnvPaths;

  /**
   * The entry points of the source code
   */
  entry: TEntry[];

  /**
   * The installations required by the project
   */
  packageDeps: PluginPackageDependencies;

  /**
   * The parsed TypeScript configuration from the `tsconfig.json` file
   */
  tsconfig: ParsedTypeScriptConfig;

  /**
   * The project's `package.json` file content
   */
  packageJson: PackageJson;

  /**
   * The project's `project.json` file content
   */
  projectJson?: Record<string, any>;

  /**
   * The virtual file system manager used during the build process to reference generated runtime files
   */
  vfs: VirtualFileSystemInterface;

  /**
   * The Jiti module resolver
   */
  resolver: Jiti;

  /**
   * The project root directory
   */
  compiler: CompilerInterface;

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

export interface SerializedVirtualFileSystem {
  runtimeIdMap: Record<string, string>;
  virtualFiles: DirectoryJSON<string | null>;
}
