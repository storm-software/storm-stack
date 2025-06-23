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
  Options,
  VirtualFileOptions
} from "../../types/build";

/**
 * Represents a virtual file system (VFS) that stores files and their associated metadata in virtual memory.
 *
 * @remarks
 * This class provides methods to manage virtual files, check their existence, retrieve their content, and manipulate the virtual file system. It allows for efficient file management and retrieval without relying on the actual file system.
 */
export class VirtualFileSystem<TOptions extends Options = Options>
  implements IVirtualFileSystem
{
  #vfs: Map<string, Vinyl>;

  #context: Context<Options>;

  /**
   * Exposes the internal VFS map for advanced usage.
   */
  public get [__vfs__](): Map<string, Vinyl> {
    return this.#vfs;
  }

  constructor(context: Context<TOptions>) {
    this.#context = context;
    this.#vfs = new Map<string, Vinyl>();
  }

  /**
   * Returns the internal virtual file system map.
   */
  public getVirtualMap = (): Map<string, Vinyl> => {
    return this.#vfs;
  };

  /**
   * Checks if a file exists in the virtual file system (VFS) or the file system.
   *
   * @param path - The path to the file.
   * @returns True if the file exists, otherwise false.
   */
  public has = (path: string): boolean => {
    return (
      this.getVirtualMap().has(path) ||
      this.getVirtualMap().has(
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
      cwd: this.#context.workspaceConfig.workspaceRoot,
      base: this.#context.options.projectRoot,
      ...options,
      checksum: this.#context.meta.checksum
    });
    this.getVirtualMap().set(virtualFile.path, virtualFile);
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
      const vfsPath = this.getVirtualMap().has(path)
        ? path
        : joinPaths(this.#context.workspaceConfig.workspaceRoot, path);

      if (this.getVirtualMap().has(vfsPath)) {
        const file = this.getVirtualMap().get(vfsPath);

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
            this.getVirtualMap().set(p, new Vinyl({ path: p, content }));
          }
        }
      });
    } else if (typeof param === "string") {
      const content = this.getSafe(param);
      if (content) {
        this.getVirtualMap().set(param, new Vinyl({ path: param, content }));
      }
    } else if (param instanceof Map) {
      param.forEach((content, p) => {
        this.getVirtualMap().set(p, new Vinyl({ path: p, content }));
      });
    }
  };

  /**
   * Retrieves the keys of the virtual file system (VFS).
   *
   * @returns An array of file paths in the VFS.
   */
  public keys = (): string[] => {
    return Array.from(this.getVirtualMap().keys());
  };

  /**
   * Retrieves the values of the virtual file system (VFS).
   *
   * @returns An array of Vinyl instances in the VFS.
   */
  public values = (): Vinyl[] => {
    return Array.from(this.getVirtualMap().values());
  };

  /**
   * Retrieves the entries of the virtual file system (VFS).
   *
   * @returns An array of tuples where each tuple contains a file path and its corresponding Vinyl instance.
   */
  public entries = (): [string, Vinyl][] => {
    return Array.from(this.getVirtualMap().entries());
  };
}

/**
 * Creates a new virtual file system (VFS) using a Map to store {@link Vinyl} instances.
 *
 * @returns A virtual file-system containing a map where the keys are file paths and the values are {@link Vinyl} instances.
 */
export function createVfs<TOptions extends Options = Options>(
  context: Context<TOptions>
): VirtualFileSystem {
  return new VirtualFileSystem(context);
}
