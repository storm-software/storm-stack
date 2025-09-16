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

import type { Volume } from "memfs";
import {
  MakeDirectoryOptions as FsMakeDirectoryOptions,
  WriteFileOptions as FsWriteFileOptions,
  Mode,
  PathLike,
  PathOrFileDescriptor,
  RmDirOptions,
  RmOptions,
  Stats,
  StatSyncOptions
} from "node:fs";
import { IUnionFs } from "unionfs";

export type VirtualFileExtension = "js" | "ts" | "jsx" | "tsx";

// eslint-disable-next-line ts/naming-convention
export const __VFS_INIT__ = "__VFS_INIT__";

// eslint-disable-next-line ts/naming-convention
export const __VFS_REVERT__ = "__VFS_REVERT__";

// eslint-disable-next-line ts/naming-convention
export const __VFS_CACHE__ = "__VFS_CACHE__";

// eslint-disable-next-line ts/naming-convention
export const __VFS_RESOLVER__ = "__VFS_RESOLVER__";

// eslint-disable-next-line ts/naming-convention
export const __VFS_VIRTUAL__ = "__VFS_VIRTUAL__";

// eslint-disable-next-line ts/naming-convention
export const __VFS_UNIFIED__ = "__VFS_UNIFIED__";

export interface VirtualFile {
  /**
   * A virtual path to the file in the virtual file system.
   */
  path: string;

  /**
   * The contents of the virtual file.
   */
  contents: string;
}

export interface VirtualRuntimeFile extends VirtualFile {
  /**
   * The unique identifier for the virtual file.
   *
   * @remarks
   * This property is read-only and is set when the file is created.
   */
  id: string;
}

export type OutputModeType = "fs" | "virtual";

export interface ResolveFSOptions {
  outputMode?: OutputModeType;
}

export type MakeDirectoryOptions = (Mode | FsMakeDirectoryOptions) &
  ResolveFSOptions;

export interface ResolvePathOptions extends ResolveFSOptions {
  /**
   * Should the resolved path include the file extension?
   *
   * @defaultValue true
   */
  withExtension?: boolean;

  /**
   * The paths to search for the file.
   */
  paths?: string[];

  /**
   * The type of the path to resolve.
   */
  type?: "file" | "directory";
}

export type WriteFileOptions = FsWriteFileOptions & ResolveFSOptions;

export interface WriteRuntimeFileOptions extends ResolveFSOptions {
  skipFormat?: boolean;
}

export interface VirtualFileSystemInterface {
  [__VFS_INIT__]: () => void;
  [__VFS_REVERT__]: () => void;

  /**
   * The underlying runtime Ids.
   */
  runtimeIdMap: Map<string, string>;

  /**
   * Checks if a path or ID corresponds to a runtime file.
   *
   * @param id - The id of the runtime file to check against.
   * @param pathOrId - The path or id of the file to check.
   * @returns Whether the path or ID corresponds to a runtime file.
   */
  isMatchingRuntimeId: (id: string, pathOrId: string) => boolean;

  /**
   * Checks if a provided string is a valid runtime ID (does not need to already be created in the file system).
   *
   * @param id - The ID to check.
   * @returns Whether the ID is a valid runtime ID.
   */
  isValidRuntimeId: (id: string) => boolean;

  /**
   * Check if a path or ID corresponds to a virtual file.
   *
   * @param pathOrId - The path or ID to check.
   * @param options - Optional parameters for resolving the path.
   * @returns Whether the path or ID corresponds to a virtual file.
   */
  isVirtualFile: (pathOrId: string, options?: ResolvePathOptions) => boolean;

  /**
   * Check if a path exists within one of the directories specified in the tsconfig.json's `path` field.
   *
   * @see https://www.typescriptlang.org/tsconfig#paths
   *
   * @param pathOrId - The path or ID to check.
   * @returns Whether the path or ID corresponds to a virtual file.
   */
  isTsconfigPath: (pathOrId: string) => boolean;

  /**
   * Checks if a given path or ID corresponds to a runtime file.
   */
  isRuntimeFile: (pathOrID: string, options?: ResolvePathOptions) => boolean;

  /**
   * Returns a list of runtime files in the virtual file system.
   */
  listRuntimeFiles: () => Promise<VirtualRuntimeFile[]>;

  /**
   * Checks if a file exists in the virtual file system (VFS).
   */
  existsSync: (pathOrId: string) => boolean;

  /**
   * Checks if a file exists in the virtual file system (VFS).
   *
   * @param path - The path of the file to check.
   * @returns `true` if the file exists, otherwise `false`.
   */
  fileExistsSync: (path: string) => boolean;

  /**
   * Checks if a directory exists in the virtual file system (VFS).
   *
   * @param path - The path of the directory to check.
   * @returns `true` if the directory exists, otherwise `false`.
   */
  directoryExistsSync: (path: string) => boolean;

  /**
   * Checks if a path exists in the virtual file system (VFS).
   *
   * @param path - The path to check.
   * @returns `true` if the path exists, otherwise `false`.
   */
  pathExistsSync: (path: string) => boolean;

  /**
   * Gets the stats of a file in the virtual file system (VFS).
   *
   * @param pathOrId - The path or id of the file.
   * @param options - Optional parameters for getting the stats.
   * @returns The stats of the file if it exists, otherwise undefined.
   */
  lstat: (
    pathOrId: string,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
      throwIfNoEntry: false;
    }
  ) => Promise<Stats>;

  /**
   * Gets the stats of a file in the virtual file system (VFS).
   *
   * @param pathOrId - The path or id of the file.
   * @param options - Optional parameters for getting the stats.
   * @returns The stats of the file if it exists, otherwise undefined.
   */
  lstatSync: (
    pathOrId: string,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
      throwIfNoEntry: false;
    }
  ) => Stats | undefined;

  /**
   * Gets the stats of a file in the virtual file system (VFS).
   *
   * @param pathOrId - The path or id of the file.
   * @returns The stats of the file if it exists, otherwise false.
   */
  stat: (
    pathOrId: string,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
      throwIfNoEntry: false;
    }
  ) => Promise<Stats>;

  /**
   * Gets the stats of a file in the virtual file system (VFS).
   *
   * @param pathOrId - The path or id of the file.
   * @returns The stats of the file if it exists, otherwise false.
   */
  statSync: (
    pathOrId: string,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
      throwIfNoEntry: false;
    }
  ) => Stats | undefined;

  /**
   * Lists files in a given path.
   *
   * @param path - The path to list files from.
   * @param options - Options for listing files, such as encoding and recursion.
   * @returns An array of file names in the specified path.
   */
  readdirSync: (
    path: string,
    options?:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding
  ) => string[];

  /**
   * Lists files in a given path.
   *
   * @param path - The path to list files from.
   * @param options - Options for listing files, such as encoding and recursion.
   * @returns An array of file names in the specified path.
   */
  readdir: (
    path: string,
    options?:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding
  ) => Promise<string[]>;

  /**
   * Removes a file or symbolic link in the virtual file system (VFS).
   *
   * @param path - The path to the file to remove.
   * @returns A promise that resolves when the file is removed.
   */
  unlinkSync: (path: PathLike, options?: ResolveFSOptions) => void;

  /**
   * Asynchronously removes a file or symbolic link in the virtual file system (VFS).
   *
   * @param path - The path to the file to remove.
   * @returns A promise that resolves when the file is removed.
   */
  unlink: (path: string, options?: ResolveFSOptions) => Promise<void>;

  /**
   * Removes a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   */
  rmdirSync: (path: PathLike, options?: RmDirOptions & ResolveFSOptions) => any;

  /**
   * Removes a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   * @returns A promise that resolves to the path of the created directory, or undefined if the directory could not be created.
   */
  rmdir: (
    path: PathLike,
    options?: RmDirOptions & ResolveFSOptions
  ) => Promise<void>;

  /**
   * Removes a file in the virtual file system (VFS).
   *
   * @param path - The path to the file to remove.
   * @param options - Options for removing the file.
   * @returns A promise that resolves when the file is removed.
   */
  rm: (path: PathLike, options?: RmOptions & ResolveFSOptions) => Promise<void>;

  /**
   * Creates a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   * @returns A promise that resolves to the path of the created directory, or undefined if the directory could not be created.
   */
  mkdirSync: (
    path: PathLike,
    options?: MakeDirectoryOptions
  ) => string | undefined;

  /**
   * Creates a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   * @returns A promise that resolves to the path of the created directory, or undefined if the directory could not be created.
   */
  mkdir: (
    path: PathLike,
    options?: MakeDirectoryOptions
  ) => Promise<string | undefined>;

  /**
   * Reads a file from the virtual file system (VFS).
   *
   * @param pathOrId - The path or id of the file.
   * @returns The contents of the file if it exists, otherwise undefined.
   */
  readFile: (pathOrId: string) => Promise<string | undefined>;

  /**
   * Reads a file from the virtual file system (VFS).
   *
   * @param pathOrId - The path or id of the file.
   */
  readFileSync: (pathOrId: string) => string | undefined;

  /**
   * Writes a file to the virtual file system (VFS).
   *
   * @param file - The path to the file.
   * @param data - The contents of the file.
   * @param options - Optional parameters for writing the file.
   * @returns A promise that resolves when the file is written.
   */
  writeFile: (
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options?: WriteFileOptions
  ) => Promise<void>;

  /**
   * Writes a file to the virtual file system (VFS).
   *
   * @param file - The path to the file.
   * @param data - The contents of the file.
   * @param options - Optional parameters for writing the file.
   */
  writeFileSync: (
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options?: WriteFileOptions
  ) => void;

  /**
   * Adds a runtime file to the virtual file system.
   *
   * @param id - The unique identifier for the runtime file.
   * @param path - The path to the runtime file.
   * @param contents - The contents of the runtime file.
   * @param options - Optional parameters for writing the runtime file.
   */
  writeRuntimeFile: (
    id: string,
    path: string,
    contents: string,
    options?: { skipFormat?: boolean }
  ) => Promise<void>;

  /**
   * Adds an entry file to the virtual file system.
   *
   * @param name - The unique identifier for the entry file.
   * @param contents - The contents of the entry file.
   * @param options - Optional parameters for writing the entry file.
   */
  writeEntryFile: (
    name: string,
    contents: string,
    options?: { skipFormat?: boolean }
  ) => Promise<void>;

  /**
   * Writes a file to disk from the physical file system (on disk).
   *
   * @param path - The path to the file to write.
   * @param contents - The contents of the file to write.
   * @param options - Optional parameters for writing the file.
   * @returns A promise that resolves when the file is written.
   */
  writeFileToDisk: (
    path: string,
    contents: string,
    options?: { skipFormat?: boolean }
  ) => Promise<void>;

  /**
   * Resolves a path or ID to a file path in the virtual file system.
   *
   * @param pathOrId - The path or id of the file to resolve.
   * @param options - Optional parameters for resolving the path.
   * @returns The resolved path of the file if it exists, otherwise false.
   */
  resolvePath: (
    pathOrId: string,
    options?: ResolvePathOptions
  ) => string | false;

  /**
   * Resolves a path or ID to a file path in the virtual file system.
   *
   * @param pathOrId - The path or id of the file to resolve.
   * @returns The resolved path of the file if it exists, otherwise false.
   */
  realpathSync: (pathOrId: string) => string;

  /**
   * Resolves a path or ID to a runtime file id in the virtual file system.
   *
   * @param pathOrId - The path or id of the file to resolve.
   * @param paths - Optional array of paths to search for the file.
   * @returns The resolved id of the runtime file if it exists, otherwise false.
   */
  resolveId: (pathOrId: string) => string | false;

  /**
   * Resolves a path based on TypeScript's `tsconfig.json` paths.
   *
   * @see https://www.typescriptlang.org/tsconfig#paths
   *
   * @param path - The path to check.
   * @returns The resolved file path if it exists, otherwise undefined.
   */
  resolveTsconfigPath: (path: string) => string | false;

  /**
   * Resolves a package name based on TypeScript's `tsconfig.json` paths.
   *
   * @see https://www.typescriptlang.org/tsconfig#paths
   *
   * @param path - The path to check.
   * @returns The resolved package name if it exists, otherwise undefined.
   */
  resolveTsconfigPathPackage: (path: string) => string | false;

  /**
   * A map of cached file paths to their underlying file content.
   */
  [__VFS_CACHE__]: Map<string, string>;

  /**
   * A reference to the underlying virtual file system.
   */
  [__VFS_VIRTUAL__]: Volume;

  /**
   * A reference to the underlying unified file system.
   */
  [__VFS_UNIFIED__]: IUnionFs;
}
