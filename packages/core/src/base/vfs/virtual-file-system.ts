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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { bufferToString } from "@stryke/convert/buffer-to-string";
import { toArray } from "@stryke/convert/to-array";
import { murmurhash } from "@stryke/hash/murmurhash";
import { findFilePath } from "@stryke/path/file-path-fns";
import { isParentPath } from "@stryke/path/is-parent-path";
import { isAbsolutePath } from "@stryke/path/is-type";
import { joinPaths } from "@stryke/path/join-paths";
import { prettyBytes } from "@stryke/string-format/pretty-bytes";
import { isBuffer } from "@stryke/type-checks/is-buffer";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetString } from "@stryke/type-checks/is-set-string";
import defu from "defu";
import { Volume } from "memfs";
import { Blob } from "node:buffer";
import fs, {
  ObjectEncodingOptions,
  PathLike,
  PathOrFileDescriptor,
  Stats,
  StatSyncOptions
} from "node:fs";
import { format, resolveConfig } from "prettier";
import { IFS, IUnionFs, Union } from "unionfs";
import { extendLog } from "../../lib/logger";
import { LogFn } from "../../types/config";
import { Context, SerializedVirtualFileSystem } from "../../types/context";
import {
  __VFS_CACHE__,
  __VFS_INIT__,
  __VFS_RESOLVER__,
  __VFS_REVERT__,
  __VFS_UNIFIED__,
  __VFS_VIRTUAL__,
  MakeDirectoryOptions,
  OutputModeType,
  ResolveFSOptions,
  ResolvePathOptions,
  VirtualBuiltinFile,
  VirtualFileSystemInterface,
  WriteBuiltinFileOptions,
  WriteFileOptions
} from "../../types/vfs";
import { checkVariants, cloneFS, patchFS, toFilePath } from "./helpers";

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 */
// function stripBOM(content: string) {
//   if (content.charCodeAt(0) === 0xfeff) {
//     content = content.slice(1);
//   }
//   return content;
// }

// type ModuleBuiltIn = typeof _Module & {
//   _extensions: Record<
//     string,
//     (
//       module: {
//         _compile: (content: string, fileName: string) => void;
//         exports: any;
//       },
//       fileName: string
//     ) => void
//   >;
//   _findPath: (
//     request: string,
//     paths: string[],
//     isMain: boolean
//   ) => false | string;
//   _resolveFilename: (request: string, parent: string) => string;
//   _pathCache: Record<string, string>;
// };

// const Module: ModuleBuiltIn = _Module as ModuleBuiltIn;

export const RUNTIME_PREFIX = "storm:";

/**
 * Represents a virtual file system (VFS) that stores files and their associated metadata in virtual memory.
 *
 * @remarks
 * This class provides methods to manage virtual files, check their existence, retrieve their content, and manipulate the virtual file system. It allows for efficient file management and retrieval without relying on the actual file system.
 */
export class VirtualFileSystem implements VirtualFileSystemInterface {
  /**
   * The internal map of virtual files.
   */
  #builtinIdMap: Map<string, string> = new Map<string, string>();

  /**
   * A map of virtual file paths to their underlying file content.
   */
  #cachedFS: Map<string, string> = new Map<string, string>();

  /**
   * A map of virtual file paths to their underlying file content.
   */
  #cachedResolver: Map<string, string | false> = new Map<
    string,
    string | false
  >();

  /**
   * The internal map of virtual files.
   */
  #virtualFS: Volume = new Volume();

  /**
   * The physical file system.
   */
  #fs: typeof fs = cloneFS(fs);

  /**
   * The unified volume that combines the virtual file system with the real file system.
   *
   * @remarks
   * This volume allows for seamless access to both virtual and real files.
   */
  #unifiedFS = new Union();

  /**
   * Indicator specifying if the file system module is patched
   */
  #isPatched = false;

  /**
   * Function to revert require patch
   */
  #revert: (() => void) | undefined;

  /**
   * The context of the virtual file system.
   */
  #context: Context;

  /**
   * The file system's logging function.
   */
  #log: LogFn;

  /**
   * Exposes the internal VFS map for advanced usage.
   */
  public get [__VFS_CACHE__](): Map<string, string> {
    return this.#cachedFS;
  }

  /**
   * Exposes the internal VFS resolver cache for advanced usage.
   */
  public get [__VFS_RESOLVER__](): Map<string, string | false> {
    return this.#cachedResolver;
  }

  /**
   * Exposes the internal VFS map for advanced usage.
   */
  public get [__VFS_VIRTUAL__](): Volume {
    return this.#virtualFS;
  }

  /**
   * Exposes the internal UFS map for advanced usage.
   */
  public get [__VFS_UNIFIED__](): IUnionFs {
    return this.#unifiedFS;
  }

  /**
   * Creates a new instance of the VirtualFileSystem.
   *
   * @param context - The context of the virtual file system, typically containing options and logging functions.
   * @param serialized - A map of files/file contents to populate in cache
   */
  constructor(context: Context, serialized?: SerializedVirtualFileSystem) {
    this.#context = context;
    this.#cachedFS = new Map();
    this.#builtinIdMap = new Map(
      Object.entries(serialized?.builtinIdMap ?? {})
    );

    if (!this.#fs.existsSync(this.#context.dataPath)) {
      this.#fs.mkdirSync(this.#context.dataPath, {
        recursive: true
      });
    }

    if (!this.#fs.existsSync(this.#context.cachePath)) {
      this.#fs.mkdirSync(this.#context.cachePath, {
        recursive: true
      });
    }

    if (
      !this.#fs.existsSync(
        joinPaths(
          this.#context.options.workspaceRoot,
          this.#context.options.output.outputPath
        )
      )
    ) {
      this.#fs.mkdirSync(
        joinPaths(
          this.#context.options.workspaceRoot,
          this.#context.options.output.outputPath
        ),
        {
          recursive: true
        }
      );
    }

    this.#unifiedFS = this.#unifiedFS.use(this.#fs);

    if (this.#context.options.output.outputMode !== "fs") {
      if (
        serialized?.virtualFiles &&
        Object.keys(serialized.virtualFiles).length > 0
      ) {
        this.#virtualFS = Volume.fromJSON(serialized.virtualFiles);
      }

      if (!this.#virtualFS.existsSync(this.#context.artifactsPath)) {
        this.#virtualFS.mkdirSync(this.#context.artifactsPath, {
          recursive: true
        });
      }

      if (!this.#virtualFS.existsSync(this.#context.builtinsPath)) {
        this.#virtualFS.mkdirSync(this.#context.builtinsPath, {
          recursive: true
        });
      }

      if (!this.#virtualFS.existsSync(this.#context.entryPath)) {
        this.#virtualFS.mkdirSync(this.#context.entryPath, {
          recursive: true
        });
      }

      if (!this.#virtualFS.existsSync(this.#context.dtsPath)) {
        this.#virtualFS.mkdirSync(this.#context.dtsPath, {
          recursive: true
        });
      }

      this.#unifiedFS = this.#unifiedFS.use(this.#virtualFS as any);
    } else if (this.#context.options.projectType === "application") {
      if (!this.#fs.existsSync(this.#context.artifactsPath)) {
        this.#fs.mkdirSync(this.#context.artifactsPath, {
          recursive: true
        });
      }

      if (!this.#fs.existsSync(this.#context.builtinsPath)) {
        this.#fs.mkdirSync(this.#context.builtinsPath, {
          recursive: true
        });
      }

      if (!this.#fs.existsSync(this.#context.entryPath)) {
        this.#fs.mkdirSync(this.#context.entryPath, {
          recursive: true
        });
      }

      if (!this.#fs.existsSync(this.#context.dtsPath)) {
        this.#fs.mkdirSync(this.#context.dtsPath, {
          recursive: true
        });
      }
    }

    this.#log = extendLog(this.#context.log, "virtual-file-system");
  }

  public [__VFS_INIT__]() {
    if (!this.#isPatched && this.#context.options.output.outputMode !== "fs") {
      this.#revert = patchFS(fs, this);
      this.#isPatched = true;
    }
  }

  public [__VFS_REVERT__]() {
    if (this.#isPatched && this.#context.options.output.outputMode !== "fs") {
      if (!this.#revert) {
        throw new Error(
          "Attempting to revert File System patch prior to calling `__init__` function"
        );
      }

      this.#revert?.();
      this.#isPatched = false;
    }
  }

  /**
   * Returns a Map of all runtime file IDs and their corresponding paths in the virtual file system.
   *
   * @returns A Map where the keys are runtime file IDs (strings) and the values are their corresponding paths (strings).
   */
  public get builtinIdMap(): Map<string, string> {
    return this.#builtinIdMap;
  }

  /**
   * Lists all runtime IDs in the virtual file system.
   *
   * @returns An array of formatted runtime IDs.
   */
  public get runtimeIds(): string[] {
    return Array.from(this.builtinIdMap.keys()).map(id =>
      this.formatRuntimeId(id)
    );
  }

  /**
   * Checks if a given path or ID corresponds to a runtime file.
   *
   * @param pathOrId - The path or ID to check.
   * @param options - Options for resolving the path, such as paths to check.
   * @returns `true` if the path or ID corresponds to a runtime file, otherwise `false`.
   */
  public isBuiltinFile(
    pathOrId: string,
    options?: ResolvePathOptions
  ): boolean {
    return !!this.builtinIdMap
      .values()
      .find(
        path =>
          path === this.resolvePath(pathOrId, { ...options, type: "file" })
      );
  }

  /**
   * Checks if a provided string is a valid runtime ID (does not need to already be created in the file system).
   *
   * @param id - The ID to check.
   * @returns Whether the ID is a valid runtime ID.
   */
  public isValidBuiltinId(id: string): boolean {
    return id.startsWith(RUNTIME_PREFIX);
  }

  /**
   * Check if a path or ID corresponds to a virtual file.
   *
   * @param pathOrId - The path or ID to check.
   * @param options - Options for resolving the path, such as paths to check.
   * @returns Whether the path or ID corresponds to a virtual file.
   */
  public isVirtualFile(
    pathOrId: string,
    options: ResolvePathOptions = {}
  ): boolean {
    if (!pathOrId) {
      return false;
    }

    const resolvedPath = this.resolvePath(pathOrId, {
      ...options,
      type: "file"
    });
    if (!resolvedPath) {
      return false;
    }

    // Check if the resolved path is a runtime file
    if (this.builtinIdMap.values().find(path => path === resolvedPath)) {
      return true;
    }

    return this.#virtualFS.existsSync(resolvedPath);
  }

  /**
   * Check if a path exists within one of the directories specified in the tsconfig.json's `path` field.
   *
   * @see https://www.typescriptlang.org/tsconfig#paths
   *
   * @param pathOrId - The path or ID to check.
   * @returns Whether the path or ID corresponds to a virtual file.
   */
  public isTsconfigPath(pathOrId: string): boolean {
    return (
      !!this.#context.tsconfig.options.paths &&
      Object.keys(this.#context.tsconfig.options.paths).some(path =>
        pathOrId.startsWith(path.replaceAll("*", ""))
      )
    );
  }

  /**
   * Checks if a given ID corresponds to a runtime file path.
   *
   * @param id - The unique identifier for the runtime file.
   * @param pathOrId - The path or ID to check.
   * @returns `true` if the ID corresponds to the path or ID of a runtime file, otherwise `false`.
   */
  public isMatchingBuiltinId(id: string, pathOrId: string): boolean {
    const resolvedPath = this.resolvePath(pathOrId);
    const resolvedId = this.resolveId(pathOrId);

    return !!(
      this.isBuiltinFile(pathOrId) &&
      ((resolvedPath &&
        (resolvedPath === this.builtinIdMap.get(id) ||
          resolvedPath === this.builtinIdMap.get(this.formatRuntimeId(id)))) ||
        (resolvedId &&
          (resolvedId === this.builtinIdMap.get(id) ||
            resolvedId === this.builtinIdMap.get(this.formatRuntimeId(id)))))
    );
  }

  /**
   * Lists all runtime files in the virtual file system.
   *
   * @returns A promise that resolves to an array of runtime files.
   */
  public async listBuiltinFiles(): Promise<VirtualBuiltinFile[]> {
    const runtimeFiles: VirtualBuiltinFile[] = [];
    for (const [id, path] of this.builtinIdMap.entries()) {
      const contents = await this.readFile(path);
      if (contents) {
        runtimeFiles.push({
          id: this.formatRuntimeId(id),
          path,
          contents
        });
      }
    }

    return runtimeFiles;
  }

  /**
   * Lists files in a given path.
   *
   * @param path - The path to list files from.
   * @param options - Options for listing files, such as encoding and recursion.
   * @returns An array of file names in the specified path.
   */
  public readdirSync(
    path: fs.PathLike,
    options:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding = "utf8"
  ): string[] {
    return this.resolveFS(path).readdirSync(toFilePath(path), options);
  }

  /**
   * Removes a file in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   */
  public unlinkSync(path: fs.PathLike, options?: ResolveFSOptions) {
    const formattedPath = toFilePath(path);
    if (!this.fileExistsSync(path)) {
      return;
    }

    this.#log(
      LogLevelLabel.TRACE,
      `Synchronously removing file: ${formattedPath}`
    );

    this.resolveFS(path, options).unlinkSync(formattedPath);

    this.#cachedFS.delete(formattedPath);
    this.clearResolverCache(formattedPath);
  }

  /**
   * Removes a file in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   */
  public async unlink(
    path: fs.PathLike,
    options?: ResolveFSOptions
  ): Promise<void> {
    const formattedPath = toFilePath(path);
    if (!this.fileExistsSync(path)) {
      return;
    }

    this.#log(LogLevelLabel.TRACE, `Removing file: ${formattedPath}`);

    if (isFunction(this.resolveFS(path, options).promises.unlink)) {
      await this.resolveFS(path, options).promises.unlink(formattedPath);

      this.#cachedFS.delete(formattedPath);
      this.clearResolverCache(formattedPath);
    } else {
      this.unlinkSync(formattedPath, options);
    }
  }

  /**
   * Removes a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   */
  public rmdirSync(
    path: fs.PathLike,
    options: fs.RmDirOptions & ResolveFSOptions = {}
  ) {
    const formattedPath = toFilePath(path);
    if (!this.directoryExistsSync(path)) {
      return;
    }

    this.#log(
      LogLevelLabel.TRACE,
      `Synchronously removing directory: ${formattedPath}`
    );

    this.resolveFS(path, options).rmdirSync(
      formattedPath,
      defu(options, {
        recursive: true
      })
    );

    this.#cachedFS.delete(formattedPath);
    this.clearResolverCache(formattedPath);
  }

  /**
   * Removes a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   * @returns A promise that resolves to the path of the created directory, or undefined if the directory could not be created.
   */
  public async rmdir(
    path: fs.PathLike,
    options: fs.RmDirOptions & ResolveFSOptions = {}
  ): Promise<void> {
    const formattedPath = toFilePath(path);
    if (!this.directoryExistsSync(path)) {
      return;
    }

    this.#log(LogLevelLabel.TRACE, `Removing directory: ${formattedPath}`);

    if (isFunction(this.resolveFS(path, options).promises.rm)) {
      await this.resolveFS(path, options).promises.rm(
        formattedPath,
        defu(options, {
          force: true,
          recursive: true
        })
      );

      this.#cachedFS.delete(formattedPath);
      this.clearResolverCache(formattedPath);
    } else {
      this.rmdirSync(
        formattedPath,
        defu(options ?? {}, {
          force: true,
          recursive: true
        })
      );
    }
  }

  /**
   * Removes a file in the virtual file system (VFS).
   *
   * @param path - The path to the file to remove.
   * @param options - Options for removing the file.
   * @returns A promise that resolves when the file is removed.
   */
  public async rm(
    path: fs.PathLike,
    options: fs.RmOptions & ResolveFSOptions = {}
  ): Promise<void> {
    this.#log(LogLevelLabel.TRACE, `Removing: ${toFilePath(path)}`);

    if (this.directoryExistsSync(path)) {
      return this.rmdir(path, options);
    }

    return this.unlink(path, options);
  }

  /**
   * Creates a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   * @returns A promise that resolves to the path of the created directory, or undefined if the directory could not be created.
   */
  public mkdirSync(
    path: fs.PathLike,
    options: MakeDirectoryOptions = {}
  ): string | undefined {
    const filePath = toFilePath(path);

    this.clearResolverCache(filePath);
    return this.resolveFS(filePath, options).mkdirSync(
      filePath,
      defu(options ?? {}, {
        recursive: true
      })
    );
  }

  /**
   * Creates a directory in the virtual file system (VFS).
   *
   * @param path - The path to create the directory at.
   * @param options - Options for creating the directory.
   * @returns A promise that resolves to the path of the created directory, or undefined if the directory could not be created.
   */
  public async mkdir(
    path: fs.PathLike,
    options: MakeDirectoryOptions = {}
  ): Promise<string | undefined> {
    let result: string | undefined;

    const filePath = toFilePath(path);

    if (isFunction(this.resolveFS(filePath, options).promises.mkdir)) {
      result = await this.resolveFS(filePath, options).promises.mkdir(
        filePath,
        defu(options ?? {}, {
          recursive: true
        })
      );
    } else {
      result = this.resolveFS(filePath, options).mkdirSync(
        filePath,
        defu(options ?? {}, {
          recursive: true
        })
      );
    }

    this.clearResolverCache(filePath);
    return result;
  }

  /**
   * Lists files in a given path.
   *
   * @param path - The path to list files from.
   * @param options - Options for listing files, such as encoding and recursion.
   * @returns An array of file names in the specified path.
   */
  public async readdir(
    path: PathLike,
    options:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding = "utf8"
  ): Promise<string[]> {
    return this.resolveFS(path).promises.readdir(toFilePath(path), options);
  }

  /**
   * Asynchronously reads a file from the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID of the file to read.
   * @returns A promise that resolves to the contents of the file as a string, or undefined if the file does not exist.
   */
  public async readFile(
    pathOrId: PathLike,
    options:
      | (ObjectEncodingOptions & {
          flag?: string | undefined;
        })
      | BufferEncoding = "utf8"
  ): Promise<string | undefined> {
    if (!pathOrId) {
      return undefined;
    }

    const filePath = this.resolvePath(toFilePath(pathOrId), {
      type: "file"
    });
    if (filePath) {
      if (this.#cachedFS.has(filePath)) {
        return this.#cachedFS.get(filePath);
      }

      let result: string | NonSharedBuffer;
      if (isFunction(this.resolveFS(filePath).promises.readFile)) {
        result = (
          await this.resolveFS(filePath).promises.readFile(filePath, options)
        )?.toString("utf8");
      } else {
        result = this.resolveFS(filePath).readFileSync(filePath, options);
      }

      const content = isBuffer(result) ? bufferToString(result) : result;
      this.#cachedFS.set(filePath, content);

      return content;
    }

    return undefined;
  }

  /**
   * Synchronously reads a file from the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID of the file to read.
   * @returns The contents of the file as a string, or undefined if the file does not exist.
   */
  public readFileSync(
    pathOrId: PathLike,
    options:
      | (fs.ObjectEncodingOptions & {
          flag?: string | undefined;
        })
      | BufferEncoding
      | null = "utf8"
  ): string | undefined {
    if (!pathOrId) {
      return undefined;
    }

    const filePath = this.resolvePath(toFilePath(pathOrId), {
      type: "file"
    });
    if (filePath) {
      if (this.#cachedFS.has(filePath)) {
        return this.#cachedFS.get(filePath);
      }

      const result = this.resolveFS(filePath).readFileSync(filePath, options);

      const content = isBuffer(result) ? bufferToString(result) : result;
      this.#cachedFS.set(filePath, content);

      return content;
    }

    return undefined;
  }

  /**
   * Writes a file to the virtual file system (VFS).
   *
   * @param file - The path to the file.
   * @param data - The contents of the file.
   * @param options - Optional parameters for writing the file.
   * @returns A promise that resolves when the file is written.
   */
  public async writeFile(
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView = "",
    options: WriteFileOptions = "utf8"
  ): Promise<void> {
    const filePath = this.formatAbsoluteFilePath(toFilePath(file));
    if (!this.directoryExistsSync(findFilePath(filePath))) {
      await this.mkdir(findFilePath(filePath), options);
    }

    this.#log(
      LogLevelLabel.TRACE,
      `Writing ${filePath} file to virtual file system (size: ${prettyBytes(
        new Blob(toArray(data)).size
      )})`
    );

    this.#cachedFS.set(filePath, data.toString());
    this.clearResolverCache(filePath);

    const ifs: IFS = this.resolveFS(filePath, options);

    if (isFunction(ifs.promises.writeFile)) {
      return ifs.promises.writeFile(filePath, data, options);
    }

    return ifs.writeFileSync(filePath, data, options);
  }

  /**
   * Synchronously writes a file to the virtual file system (VFS).
   *
   * @param file - The file to write.
   * @param data - The contents of the file.
   * @param options - Optional parameters for writing the file.
   */
  public writeFileSync(
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView = "",
    options: WriteFileOptions = "utf8"
  ): void {
    const filePath = this.formatAbsoluteFilePath(toFilePath(file));
    if (!this.directoryExistsSync(findFilePath(filePath))) {
      this.mkdirSync(findFilePath(filePath));
    }

    this.#log(
      LogLevelLabel.TRACE,
      `Writing ${filePath} file to virtual file system (size: ${prettyBytes(
        new Blob(toArray(data)).size
      )})`
    );

    this.#cachedFS.set(filePath, data.toString());
    this.clearResolverCache(filePath);

    const writeStream = this.resolveFS(filePath, options).createWriteStream(
      filePath
    );
    try {
      writeStream.write(data);
    } finally {
      writeStream.close();
    }
  }

  /**
   * Writes a runtime file to the virtual file system (VFS).
   *
   * @param id - The unique identifier for the runtime file.
   * @param path - The path to the runtime file.
   * @param contents - The contents of the runtime file.
   * @param options - Optional parameters for writing the runtime file.
   * @returns A promise that resolves when the file is written.
   */
  public async writeBuiltinFile(
    id: string,
    path: PathLike,
    contents: string,
    options: WriteBuiltinFileOptions = {}
  ): Promise<void> {
    const formattedId = this.formatRuntimeId(id);
    const absolutePath = this.formatAbsoluteFilePath(toFilePath(path));

    this.builtinIdMap.set(formattedId, absolutePath);

    let data = contents;
    if (!options.skipFormat) {
      data = await format(contents, {
        absolutePath,
        ...(await resolveConfig(absolutePath))
      });
    }

    const _options = defu(isSetString(options) ? {} : (options ?? {}), {
      encoding: isSetString(options) ? options : "utf8",
      outputMode: "virtual"
    }) as WriteFileOptions;

    this.#log(
      LogLevelLabel.DEBUG,
      `Writing runtime file ${absolutePath} (size: ${prettyBytes(
        new Blob(toArray(data)).size
      )}) to ${
        this.resolveOutputMode(absolutePath, _options) === "fs"
          ? "disk"
          : "memory"
      }`
    );

    return this.writeFile(absolutePath, data, _options);
  }

  /**
   * Adds an entry file to the virtual file system.
   *
   * @param name - The file name or absolute path of the entry module.
   * @param contents - The contents of the entry file.
   * @param options - Optional parameters for writing the entry file.
   */
  public async writeEntryFile(
    name: string,
    contents: string,
    options: WriteBuiltinFileOptions = {}
  ): Promise<void> {
    const absolutePath = this.formatAbsoluteFilePath(
      isAbsolutePath(toFilePath(name))
        ? toFilePath(name)
        : toFilePath(joinPaths(this.#context.entryPath, name))
    );

    let data = contents;
    if (!options.skipFormat) {
      data = await format(contents, {
        absolutePath,
        ...(await resolveConfig(absolutePath))
      });
    }

    const _options = defu(isSetString(options) ? {} : (options ?? {}), {
      encoding: isSetString(options) ? options : "utf8",
      outputMode: "virtual"
    }) as WriteFileOptions;

    this.#log(
      LogLevelLabel.DEBUG,
      `Writing entry file ${absolutePath} (size: ${prettyBytes(
        new Blob(toArray(data)).size
      )}) to ${
        this.resolveOutputMode(absolutePath, _options) === "fs"
          ? "disk"
          : "virtual memory"
      }`
    );

    return this.writeFile(absolutePath, data, _options);
  }

  /**
   * Writes a file to disk from the physical file system (on disk).
   *
   * @param path - The path to the file to write.
   * @param contents - The contents of the file to write.
   * @param options - Optional parameters for writing the file.
   * @returns A promise that resolves when the file is written.
   */
  public async writeFileToDisk(
    path: PathLike,
    contents: string,
    options: WriteBuiltinFileOptions = {}
  ): Promise<void> {
    const absolutePath = this.formatAbsoluteFilePath(toFilePath(path));

    let data = contents;
    if (!options.skipFormat) {
      const resolvedConfig = await resolveConfig(absolutePath);
      if (resolvedConfig) {
        data = await format(contents, {
          absolutePath,
          ...resolvedConfig
        });
      }
    }

    return this.writeFile(
      absolutePath,
      data,
      defu(
        {
          outputMode: "fs"
        },
        isSetString(options) ? {} : (options ?? {}),
        {
          encoding: isSetString(options) ? options : "utf8"
        }
      ) as WriteFileOptions
    );
  }

  /**
   * Synchronously checks if a file exists in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID of the file to check.
   * @returns `true` if the file exists, otherwise `false`.
   */
  public existsSync(pathOrId: PathLike): boolean {
    return this.pathExistsSync(
      this.resolvePath(toFilePath(pathOrId)) || toFilePath(pathOrId)
    );
  }

  /**
   * Checks if a file exists in the virtual file system (VFS).
   *
   * @remarks
   * This is a base method used by {@link existsSync} - it does not try to resolve the path prior to checking if it exists or not.
   *
   * @param path - The path of the file to check.
   * @returns `true` if the file exists, otherwise `false`.
   */
  public fileExistsSync(path: PathLike): boolean {
    const formattedPath = this.formatAbsoluteFilePath(toFilePath(path));

    return (
      this.isValidBuiltinId(formattedPath) ||
      (this.#virtualFS.existsSync(formattedPath) &&
        this.#virtualFS.lstatSync(formattedPath).isFile()) ||
      (this.#fs.existsSync(formattedPath) &&
        this.#fs.lstatSync(formattedPath).isFile()) ||
      (this.resolveFS(path).existsSync(formattedPath) &&
        this.resolveFS(path).lstatSync(formattedPath).isFile())
    );
  }

  /**
   * Checks if a directory exists in the virtual file system (VFS).
   *
   * @param path - The path of the directory to check.
   * @returns `true` if the directory exists, otherwise `false`.
   */
  public directoryExistsSync(path: PathLike): boolean {
    const formattedPath = this.formatAbsoluteFilePath(toFilePath(path));

    return (
      (this.#virtualFS.existsSync(formattedPath) &&
        this.#virtualFS.lstatSync(formattedPath).isDirectory()) ||
      (this.#fs.existsSync(formattedPath) &&
        this.#fs.lstatSync(formattedPath).isDirectory()) ||
      (this.resolveFS(path).existsSync(formattedPath) &&
        this.resolveFS(path).lstatSync(formattedPath).isDirectory())
    );
  }

  /**
   * Checks if a path exists in the virtual file system (VFS).
   *
   * @param path - The path to check.
   * @returns `true` if the path exists, otherwise `false`.
   */
  public pathExistsSync(path: PathLike): boolean {
    const formattedPath = this.formatAbsoluteFilePath(toFilePath(path));

    return (
      this.isValidBuiltinId(formattedPath) ||
      this.#virtualFS.existsSync(formattedPath) ||
      this.#fs.existsSync(formattedPath) ||
      this.resolveFS(path).existsSync(formattedPath)
    );
  }

  /**
   * Retrieves the status of a file in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID of the file to retrieve status for.
   * @returns A promise that resolves to the file's status information, or false if the file does not exist.
   */
  public async stat(
    pathOrId: PathLike,
    options?: fs.StatOptions & {
      bigint?: false | undefined;
    }
  ): Promise<Stats> {
    return this.resolveFS(pathOrId).promises.stat(
      this.resolvePath(toFilePath(pathOrId)) || toFilePath(pathOrId),
      options
    );
  }

  /**
   * Synchronously retrieves the status of a file in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID of the file to retrieve status for.
   * @returns The file's status information, or false if the file does not exist.
   */
  public statSync(pathOrId: PathLike): Stats {
    return this.resolveFS(pathOrId).statSync(
      this.resolvePath(toFilePath(pathOrId)) || toFilePath(pathOrId)
    );
  }

  /**
   * Retrieves the status of a symbolic link in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID of the symbolic link to retrieve status for.
   * @returns A promise that resolves to the symbolic link's status information, or false if the link does not exist.
   */
  public async lstat(
    pathOrId: PathLike,
    options?: fs.StatOptions & {
      bigint?: false | undefined;
    }
  ): Promise<Stats> {
    return this.resolveFS(pathOrId).promises.lstat(
      this.resolvePath(toFilePath(pathOrId)) || toFilePath(pathOrId),
      options
    );
  }

  /**
   * Synchronously retrieves the status of a symbolic link in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID of the symbolic link to retrieve status for.
   * @returns The symbolic link's status information, or false if the link does not exist.
   */
  public lstatSync(
    pathOrId: PathLike,
    options?: StatSyncOptions & {
      bigint?: false | undefined;
      throwIfNoEntry: false;
    }
  ): Stats | undefined {
    return this.resolveFS(pathOrId).lstatSync(
      this.resolvePath(toFilePath(pathOrId)) || toFilePath(pathOrId),
      options
    );
  }

  /**
   * Resolves a path or ID to a runtime file id in the virtual file system.
   *
   * @param pathOrId - The path or id of the file to resolve.
   * @returns The resolved id of the runtime file if it exists, otherwise false.
   */
  public resolveId(pathOrId: PathLike): string | false {
    if (this.builtinIdMap.has(this.formatRuntimeId(toFilePath(pathOrId)))) {
      return this.formatRuntimeId(toFilePath(pathOrId));
    }

    const filePath = this.resolvePath(toFilePath(pathOrId));
    if (filePath) {
      return (
        this.builtinIdMap
          .keys()
          .find(id => this.builtinIdMap.get(id) === filePath) || false
      );
    }

    return false;
  }

  /**
   * Resolves a path based on TypeScript's `tsconfig.json` paths.
   *
   * @see https://www.typescriptlang.org/tsconfig#paths
   *
   * @param path - The path to check.
   * @returns The resolved file path if it exists, otherwise undefined.
   */
  public resolveTsconfigPath(path: string): string | false {
    if (this.#context.tsconfig.options.paths) {
      for (const tsconfigPathKey of Object.keys(
        this.#context.tsconfig.options.paths
      ).filter(tsconfigPath =>
        path.startsWith(tsconfigPath.replaceAll("*", ""))
      )) {
        const resolvedPath = this.#context.tsconfig.options.paths[
          tsconfigPathKey
        ]?.find(
          tsconfigPath =>
            this.resolvePathName(
              joinPaths(
                this.#context.options.workspaceRoot,
                tsconfigPath.replaceAll("*", ""),
                path.replace(tsconfigPathKey.replaceAll("*", ""), "")
              )
            ) ||
            this.formatAbsoluteFilePath(tsconfigPath) ===
              this.formatAbsoluteFilePath(path)
        );
        if (resolvedPath) {
          return this.formatAbsoluteFilePath(resolvedPath) ===
            this.formatAbsoluteFilePath(path)
            ? this.formatAbsoluteFilePath(resolvedPath)
            : this.resolvePathName(
                joinPaths(
                  this.#context.options.workspaceRoot,
                  resolvedPath.replaceAll("*", ""),
                  path.replace(tsconfigPathKey.replaceAll("*", ""), "")
                )
              );
        }
      }
    }

    return false;
  }

  /**
   * Resolves a path based on TypeScript's `tsconfig.json` paths.
   *
   * @see https://www.typescriptlang.org/tsconfig#paths
   *
   * @param path - The path to check.
   * @returns The resolved file path if it exists, otherwise undefined.
   */
  public resolveTsconfigPathPackage(path: string): string | false {
    if (this.#context.tsconfig.options.paths) {
      const tsconfigPathKeys = Object.keys(
        this.#context.tsconfig.options.paths
      ).filter(tsconfigPath =>
        path.startsWith(tsconfigPath.replaceAll("*", ""))
      );
      if (tsconfigPathKeys.length > 0 && tsconfigPathKeys[0]) {
        return tsconfigPathKeys[0].replace(/\/\*$/, "");
      }
    }

    return false;
  }

  /**
   * Resolves a path or ID to its real path in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID to resolve.
   * @returns The resolved real path if it exists, otherwise undefined.
   */
  public realpathSync(pathOrId: PathLike): string {
    const filePath = this.resolvePath(toFilePath(pathOrId));
    if (!filePath) {
      throw new Error(`File not found: ${toFilePath(pathOrId)}`);
    }

    return filePath;
  }

  /**
   * Resolves a path or ID parameter to a corresponding virtual file path in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID to resolve.
   * @param options - Optional parameters for resolving the path, such as whether to include the file extension.
   * @returns The resolved file path if it exists, otherwise undefined.
   */
  public resolvePath(
    pathOrId: PathLike,
    options: ResolvePathOptions = {}
  ): string | false {
    const formattedPath = toFilePath(pathOrId);

    const resolverKey = `${formattedPath}${
      options.withExtension ? "-ext" : ""
    }${options.paths ? `-${murmurhash(options.paths)}` : ""}${
      options.type ? `-${options.type}` : ""
    }`;
    if (this.#cachedResolver.has(resolverKey)) {
      return this.#cachedResolver.get(resolverKey)!;
    } else if (this.#cachedFS.has(formattedPath)) {
      return formattedPath;
    }

    let result: string | undefined | false = false;
    if (this.isValidBuiltinId(formattedPath)) {
      result = this.builtinIdMap.get(this.formatRuntimeId(formattedPath));
    } else {
      result = this.resolvePathName(formattedPath, options);
    }

    if (!result) {
      result = false;
    } else {
      result = toFilePath(result);
    }

    if (result && options.withExtension === false) {
      return result.replace(/\.[m|c]?[t|j]sx?$/, "");
    }

    this.#cachedResolver.set(resolverKey, result);

    return result;
  }

  /**
   * Formats a file path by removing the runtime prefix and leading null character.
   *
   * @param path - The file path to format.
   * @returns The formatted file path.
   */
  public formatFilePath(path: string): string {
    if (!isSetString(path)) {
      throw new Error(
        `Invalid path provided. Expected a string or a valid file path.`
      );
    }

    return path
      .replace(new RegExp(`^${RUNTIME_PREFIX}`), "")
      .replace(/^\\0/, "");
  }

  /**
   * Converts a relative path to an absolute path based on the workspace and project root.
   *
   * @param path - The relative path to convert.
   * @returns The absolute path.
   */
  public formatAbsoluteFilePath = (path: string): string => {
    const formattedPath = this.formatFilePath(path);
    if (
      isAbsolutePath(formattedPath) ||
      formattedPath.startsWith(this.#context.options.workspaceRoot)
    ) {
      return formattedPath;
    } else if (formattedPath.startsWith(this.#context.options.projectRoot)) {
      return joinPaths(this.#context.options.workspaceRoot, formattedPath);
    }

    return formattedPath;
  };

  /**
   * Formats a runtime ID by removing the file extension and prepending the runtime prefix.
   *
   * @param id - The runtime ID to format.
   * @returns The formatted runtime ID.
   */
  public formatRuntimeId(id: string): string {
    return `${RUNTIME_PREFIX}${this.formatFilePath(id).replace(
      /\.[m|c]?[t|j]sx?$/,
      ""
    )}`;
  }

  /**
   * Resolves a path or ID parameter to a corresponding virtual file path in the virtual file system (VFS).
   *
   * @param pathOrId - The path or ID to resolve.
   * @returns The resolved file path if it exists, otherwise undefined.
   */
  private resolvePathName(
    pathOrId: string,
    options: ResolvePathOptions = {}
  ): string | false {
    if (pathOrId.startsWith(RUNTIME_PREFIX)) {
      return false;
    }

    // if (pathOrId.startsWith("@")) {
    //   const resolveOptions = {
    //     paths: [
    //       joinPaths(
    //         this.#context.options.workspaceRoot,
    //         this.#context.options.projectRoot
    //       ),
    //       this.#context.options.workspaceRoot
    //     ]
    //   };

    //   let result = resolveSafeSync(
    //     joinPaths(pathOrId, "package.json"),
    //     resolveOptions
    //   );
    //   if (!result) {
    //     result = resolveSafeSync(
    //       joinPaths(pathOrId, "index.js"),
    //       resolveOptions
    //     );
    //     if (!result) {
    //       result = resolveSafeSync(pathOrId, resolveOptions);
    //     }
    //   }

    //   if (result) {
    //     return findFilePath(result);
    //   }
    // }

    // let result = checkAbsolute(
    //   this.#context,
    //   this.formatAbsoluteFilePath(pathOrId),
    //   this,
    //   options
    // );
    // if (result) {
    //   return result;
    // }

    if (isAbsolutePath(pathOrId)) {
      if (
        options.type === "file"
          ? this.fileExistsSync(pathOrId)
          : this.pathExistsSync(pathOrId)
      ) {
        return pathOrId;
      }

      const result = checkVariants(pathOrId, this);
      if (result) {
        return result;
      }
    }

    for (const path of this.resolveParentPaths(pathOrId, options.paths)) {
      const request = joinPaths(path, pathOrId);
      if (
        options.type === "file"
          ? this.fileExistsSync(pathOrId)
          : this.pathExistsSync(pathOrId)
      ) {
        return request;
      }

      const result = checkVariants(request, this);
      if (result) {
        return result;
      }
    }

    return false;
  }

  private resolveParentPaths(request: string, current: string[] = []) {
    let paths = [
      this.#context.options.workspaceRoot,
      joinPaths(
        this.#context.options.workspaceRoot,
        this.#context.options.projectRoot
      )
    ];

    if (this.#context.tsconfig.options.paths) {
      paths = this.#context.tsconfig.options.paths
        ? Object.keys(this.#context.tsconfig.options.paths)
            .filter(tsconfigPath =>
              request.startsWith(tsconfigPath.replaceAll("*", ""))
            )
            .map(
              tsconfigPath =>
                this.#context.tsconfig.options.paths?.[tsconfigPath]
            )
            .flat()
            .reduce((ret, path) => {
              if (
                path &&
                !ret.includes(
                  joinPaths(this.#context.options.workspaceRoot, path)
                )
              ) {
                ret.push(joinPaths(this.#context.options.workspaceRoot, path));
              }

              return ret;
            }, paths)
        : paths;
    }

    return paths.reduce(
      (ret, path) => {
        if (!ret.includes(path)) {
          ret.push(path);
        }

        return ret;
      },
      current
        .filter(Boolean)
        .map(p => this.formatAbsoluteFilePath(toFilePath(p)))
    );
  }

  /**
   * Select the file system module to use for the operation based on the path or URL.
   *
   * @param pathOrUrl - The path to perform the file system operation on.
   * @param options - Options for the operation, such as output mode.
   * @returns The file system module used for the operation.
   */
  private resolveFS(
    pathOrUrl: fs.PathOrFileDescriptor,
    options: ResolveFSOptions = {}
  ): IFS {
    const outputMode = this.resolveOutputMode(pathOrUrl, options);
    if (outputMode === "virtual") {
      return this.#virtualFS as any;
    } else if (outputMode === "fs") {
      return this.#fs;
    }

    return this.#unifiedFS;
  }

  /**
   * Select the file system module to use for the operation based on the path or URL.
   *
   * @param pathOrUrl - The path to perform the file system operation on.
   * @param options - Options for the operation, such as output mode.
   * @returns The file system module used for the operation.
   */
  private resolveOutputMode(
    pathOrUrl: fs.PathOrFileDescriptor,
    options: ResolveFSOptions = {}
  ): OutputModeType | null {
    if (
      options.outputMode === "virtual" &&
      this.#context.options.output.outputMode !== "fs" &&
      isParentPath(toFilePath(pathOrUrl), this.#context.artifactsPath)
    ) {
      return "virtual";
    } else if (
      options.outputMode === "fs" ||
      this.#context.options.output.outputMode === "fs" ||
      isParentPath(toFilePath(pathOrUrl), this.#context.dataPath) ||
      isParentPath(toFilePath(pathOrUrl), this.#context.cachePath) ||
      isParentPath(
        toFilePath(pathOrUrl),
        joinPaths(
          this.#context.options.workspaceRoot,
          this.#context.options.output.outputPath
        )
      )
    ) {
      return "fs";
    }

    return null;
  }

  /**
   * Clears the resolver cache for a given path.
   *
   * @param path - The path to clear the resolver cache for.
   */
  private clearResolverCache(path: fs.PathLike) {
    this.#cachedResolver
      .keys()
      .filter(key => key.startsWith(toFilePath(path)))
      .forEach(key => this.#cachedResolver.delete(key));
  }
}

/**
 * Creates a new virtual file system (VFS) using a Map to store {@link Vinyl} instances.
 *
 * @returns A virtual file-system containing a map where the keys are file paths and the values are {@link Vinyl} instances.
 */
export function createVfs(context: Context): VirtualFileSystem {
  const vfs = new VirtualFileSystem(context);

  return vfs;
}

/**
 * Creates a new virtual file system (VFS) using a Map to store {@link Vinyl} instances.
 *
 * @returns A virtual file-system containing a map where the keys are file paths and the values are {@link Vinyl} instances.
 */
export function restoreVfs(
  context: Context,
  serialized: SerializedVirtualFileSystem
): VirtualFileSystem {
  const vfs = new VirtualFileSystem(context, serialized);

  return vfs;
}
