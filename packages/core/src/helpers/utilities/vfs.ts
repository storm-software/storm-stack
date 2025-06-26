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

import { readFileSync } from "@stryke/fs/read-file";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import { isSetString } from "@stryke/type-checks/is-set-string";
import Vinyl from "vinyl";
import {
  __vfs__,
  Context,
  IVirtualFileSystem,
  VirtualFile,
  VirtualFileOptions,
  VirtualRuntimeFile
} from "../../types/build";

/**
 * Represents a virtual file system (VFS) that stores files and their associated metadata in virtual memory.
 *
 * @remarks
 * This class provides methods to manage virtual files, check their existence, retrieve their content, and manipulate the virtual file system. It allows for efficient file management and retrieval without relying on the actual file system.
 */
export class VirtualFileSystem implements IVirtualFileSystem {
  #vfs: Map<string, VirtualFile> = new Map<string, VirtualFile>();

  #context: Context;

  /**
   * Exposes the internal VFS map for advanced usage.
   */
  public get [__vfs__](): Map<string, VirtualFile> {
    return this.#vfs;
  }

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns the internal virtual file system map.
   */
  public getAll = (): Map<string, VirtualFile> => {
    return this.#vfs;
  };

  /**
   * Returns the internal virtual, runtime file system map.
   */
  public getRuntime = (): VirtualRuntimeFile[] => {
    return this.values().filter(vm => vm.isRuntime) as VirtualRuntimeFile[];
  };

  /**
   * Returns the internal virtual, runtime file system map.
   *
   * @remarks
   * This method is used to add a runtime file to the virtual file system (VFS).
   *
   * @param name - The path to the runtime file.
   * @param contents - The contents of the runtime file.
   * @returns A Vinyl instance representing the added runtime file.
   */
  public addRuntime = (name: string, contents: string): VirtualRuntimeFile => {
    const virtualFile = new Vinyl({
      name,
      cwd: this.#context.workspaceConfig.workspaceRoot,
      base: this.#context.options.projectRoot,
      path: name,
      contents: Buffer.from(contents),
      isRuntime: true,
      checksum: this.#context.meta.checksum
    });

    this.set(virtualFile);

    return virtualFile as unknown as VirtualRuntimeFile;
  };

  /**
   * Checks if a file exists in the virtual file system (VFS) or the file system.
   *
   * @param path - The path to the file.
   * @returns True if the file exists, otherwise false.
   */
  public has = (path: string): boolean => {
    return (
      this.getAll().has(path) ||
      this.getAll().has(
        joinPaths(this.#context.workspaceConfig.workspaceRoot, path)
      ) ||
      existsSync(path) ||
      existsSync(joinPaths(this.#context.workspaceConfig.workspaceRoot, path))
    );
  };

  /**
   * Sets a virtual file in the VFS.
   *
   * @param options - The options for the virtual file, excluding the checksum.
   * @returns True if the file was set successfully.
   */
  public set = (options: Omit<VirtualFileOptions, "checksum">): boolean => {
    const virtualFile = new Vinyl({
      name: options.path,
      cwd: this.#context.workspaceConfig.workspaceRoot,
      base: this.#context.options.projectRoot,
      ...options,
      checksum: this.#context.meta.checksum
    });
    this.getAll().set(virtualFile.path, virtualFile as VirtualFile);
    return true;
  };

  /**
   * Retrieves the content of a virtual file from the VFS or the file system.
   *
   * @param path - The path to the file.
   * @returns The content of the file if it exists, otherwise undefined.
   */
  public getSafe = (path: string): string | undefined => {
    if (this.has(path)) {
      const vfsPath = this.getAll().has(path)
        ? path
        : joinPaths(this.#context.workspaceConfig.workspaceRoot, path);

      if (this.getAll().has(vfsPath)) {
        const file = this.getAll().get(vfsPath);

        return file?.content;
      } else if (
        existsSync(path) ||
        existsSync(joinPaths(this.#context.workspaceConfig.workspaceRoot, path))
      ) {
        return existsSync(path)
          ? readFileSync(path)
          : readFileSync(
              joinPaths(this.#context.workspaceConfig.workspaceRoot, path)
            );
      }
    }

    return undefined;
  };

  /**
   * Retrieves the content of a virtual file from the VFS or throws an error if it does not exist.
   *
   * @param path - The path to the file.
   * @returns The content of the file.
   * @throws If the file does not exist in the VFS or file system.
   */
  public get = (path: string): string => {
    const content = this.getSafe(path);
    if (content) {
      return content;
    }

    throw new Error(`File not found in VFS: ${path}`);
  };

  /**
   * Adds a file or files to the virtual file system (VFS).
   *
   * @param param - A single file path, an array of file paths, or a Map of file paths to content.
   */
  public add = (param: string | string[] | Map<string, string>): void => {
    if (Array.isArray(param)) {
      param.forEach(p => {
        if (isSetString(p)) {
          const content = this.getSafe(p);
          if (content) {
            this.getAll().set(
              p,
              new Vinyl({
                name: p,
                path: p,
                content,
                checksum: this.#context.meta.checksum
              }) as VirtualFile
            );
          }
        }
      });
    } else if (typeof param === "string") {
      const content = this.getSafe(param);
      if (content) {
        this.getAll().set(
          param,
          new Vinyl({
            name: param,
            path: param,
            content,
            checksum: this.#context.meta.checksum
          }) as VirtualFile
        );
      }
    } else if (param instanceof Map) {
      param.forEach((content, p) => {
        this.getAll().set(
          p,
          new Vinyl({
            name: p,
            path: p,
            content,
            checksum: this.#context.meta.checksum
          }) as VirtualFile
        );
      });
    }
  };

  /**
   * Retrieves the keys of the virtual file system (VFS).
   *
   * @returns An array of file paths in the VFS.
   */
  public keys = (): string[] => {
    return Array.from(this.getAll().keys());
  };

  /**
   * Retrieves the values of the virtual file system (VFS).
   *
   * @returns An array of Vinyl instances in the VFS.
   */
  public values = (): VirtualFile[] => {
    return Array.from(this.getAll().values());
  };

  /**
   * Retrieves the entries of the virtual file system (VFS).
   *
   * @returns An array of tuples where each tuple contains a file path and its corresponding Vinyl instance.
   */
  public entries = (): [string, VirtualFile][] => {
    return Array.from(this.getAll().entries());
  };
}

/**
 * Creates a new virtual file system (VFS) using a Map to store {@link Vinyl} instances.
 *
 * @returns A virtual file-system containing a map where the keys are file paths and the values are {@link Vinyl} instances.
 */
export function createVfs(context: Context): VirtualFileSystem {
  return new VirtualFileSystem(context);
}
