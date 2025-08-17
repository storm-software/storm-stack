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

import { isAbsolutePath } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { isFunction } from "@stryke/type-checks/is-function";
import fs, { PathOrFileDescriptor } from "node:fs";
import { Context } from "../../types/context";
import { VirtualFileSystemInterface } from "../../types/vfs";

export const FILE_PREFIX = "file://";

export function toFilePath(pathOrUrl: PathOrFileDescriptor): string {
  if (!pathOrUrl) {
    throw new Error("No Path or URL provided to Virtual File System");
  }
  let result = pathOrUrl.toString();
  if (result.startsWith(FILE_PREFIX)) {
    result = result.slice(FILE_PREFIX.length);
  }
  return result;
}

const FS_METHODS = [
  "mkdir",
  "mkdirSync",
  "rmdir",
  "rmdirSync",
  "unlink",
  "unlinkSync",
  "existsSync",
  "realpathSync",
  "writeFileSync",
  "readFileSync",
  "readdirSync",
  "createWriteStream",
  "WriteStream",
  "createReadStream",
  "ReadStream"
];

const FS_PROMISE_METHODS = [
  "mkdir",
  "rm",
  "rmdir",
  "unlink",
  "writeFile",
  "readFile",
  "readdir",
  "stat",
  "lstat"
];

export function cloneFS(originalFS: typeof fs) {
  const clonedFS: typeof fs = {
    ...originalFS,
    promises: {
      ...(originalFS.promises ?? {})
    }
  };

  for (const method of FS_METHODS) {
    if (originalFS[method]) {
      clonedFS[method] = originalFS[method];
    }
  }

  originalFS.promises ??= {} as (typeof fs)["promises"];
  for (const method of FS_PROMISE_METHODS) {
    if (originalFS.promises[method]) {
      clonedFS.promises ??= {} as (typeof fs)["promises"];
      clonedFS.promises[method] = originalFS.promises[method];
      clonedFS[method] = originalFS.promises[method];
    }
  }

  for (const prop in clonedFS) {
    if (isFunction(clonedFS[prop])) {
      clonedFS[prop] = clonedFS[prop].bind(originalFS);
      if (isFunction(clonedFS.promises[prop])) {
        clonedFS.promises[prop] = clonedFS.promises[prop].bind(originalFS);
      }
    }
  }

  for (const prop in clonedFS.promises) {
    if (isFunction(clonedFS.promises[prop])) {
      clonedFS.promises[prop] = clonedFS.promises[prop].bind(originalFS);
    }
  }

  return clonedFS;
}

/**
 * Patches the original file system module to use the virtual file system (VFS) methods.
 *
 * @param originalFS - The original file system module to patch.
 * @param vfs - The virtual file system interface to use for file operations.
 * @returns A function to restore the original file system methods.
 */
export function patchFS(
  originalFS: typeof fs,
  vfs: VirtualFileSystemInterface
): () => void {
  const clonedFS = cloneFS(originalFS);

  originalFS.mkdirSync = vfs.mkdirSync.bind(vfs);
  originalFS.mkdir = vfs.mkdir.bind(vfs);
  originalFS.promises.mkdir = vfs.mkdir.bind(vfs);

  // originalFS.rmdirSync = vfs.rmdirSync.bind(vfs);
  originalFS.unlinkSync = vfs.unlinkSync.bind(vfs);
  // originalFS.rmdir = vfs.rmdir.bind(vfs);
  // originalFS.promises.rmdir = vfs.rmdir.bind(vfs);
  originalFS.promises.rm = vfs.rm.bind(vfs);
  originalFS.promises.unlink = vfs.unlink.bind(vfs);

  originalFS.existsSync = vfs.existsSync.bind(vfs);
  originalFS.realpathSync = vfs.realpathSync.bind(vfs);

  originalFS.writeFileSync = vfs.writeFileSync.bind(vfs);
  originalFS.promises.writeFile = vfs.writeFile.bind(vfs);
  originalFS.readFileSync = vfs.readFileSync.bind(vfs);
  originalFS.promises.readFile = vfs.readFile.bind(vfs);

  originalFS.readdirSync = vfs.readdirSync.bind(vfs);
  originalFS.promises.readdir = vfs.readdir.bind(vfs);

  Object.defineProperty(originalFS, "statSync", {
    value: vfs.statSync.bind(vfs)
  });
  originalFS.stat = vfs.statSync.bind(vfs);
  originalFS.promises.stat = vfs.stat.bind(vfs);

  Object.defineProperty(originalFS, "lstatSync", {
    value: vfs.lstatSync.bind(vfs)
  });
  originalFS.lstat = vfs.lstatSync.bind(vfs);
  originalFS.promises.lstat = vfs.lstat.bind(vfs);

  return () => {
    originalFS.mkdirSync = clonedFS.mkdirSync;
    originalFS.mkdir = clonedFS.mkdir;
    originalFS.promises.mkdir = clonedFS.promises.mkdir;

    // originalFS.rmdirSync = clonedFS.rmdirSync;
    originalFS.unlinkSync = clonedFS.unlinkSync;
    // originalFS.rmdir = clonedFS.rmdir;
    // originalFS.promises.rmdir = clonedFS.promises.rmdir;
    originalFS.promises.rm = clonedFS.promises.rm;
    originalFS.promises.unlink = clonedFS.promises.unlink;

    originalFS.existsSync = clonedFS.existsSync;
    originalFS.realpathSync = clonedFS.realpathSync;

    originalFS.writeFileSync = clonedFS.writeFileSync;
    originalFS.promises.writeFile = clonedFS.promises.writeFile;
    originalFS.readFileSync = clonedFS.readFileSync;
    originalFS.promises.readFile = clonedFS.promises.readFile;

    originalFS.readdirSync = clonedFS.readdirSync;
    originalFS.promises.readdir = clonedFS.promises.readdir;

    Object.defineProperty(originalFS, "statSync", {
      value: clonedFS.statSync
    });
    originalFS.stat = clonedFS.stat;
    originalFS.promises.stat = clonedFS.promises.stat;

    Object.defineProperty(originalFS, "lstatSync", {
      value: clonedFS.lstatSync
    });
    originalFS.lstat = clonedFS.lstat;
    originalFS.promises.lstat = clonedFS.promises.lstat;
  };
}

// We convert the file names to lower case as key for file name on case insensitive file system
// While doing so we need to handle special characters (eg \u0130) to ensure that we don't convert
// it to lower case, fileName with its lowercase form can exist along side it.
// Handle special characters and make those case sensitive instead
//
// |-#--|-Unicode--|-Char code-|-Desc-------------------------------------------------------------------|
// | 1. | i        | 105       | Ascii i                                                                |
// | 2. | I        | 73        | Ascii I                                                                |
// |-------- Special characters ------------------------------------------------------------------------|
// | 3. | \u0130   | 304       | Upper case I with dot above                                            |
// | 4. | i,\u0307 | 105,775   | i, followed by 775: Lower case of (3rd item)                           |
// | 5. | I,\u0307 | 73,775    | I, followed by 775: Upper case of (4th item), lower case is (4th item) |
// | 6. | \u0131   | 305       | Lower case i without dot, upper case is I (2nd item)                   |
// | 7. | \u00DF   | 223       | Lower case sharp s                                                     |
//
// Because item 3 is special where in its lowercase character has its own
// upper case form we cant convert its case.
// Rest special characters are either already in lower case format or
// they have corresponding upper case character so they don't need special handling
//
// But to avoid having to do string building for most common cases, also ignore
// a-z, 0-9, \u0131, \u00DF, \, /, ., : and space
const FILENAME_LOWERCASE_REGEX = /[^\u0130\u0131\u00DFa-z0-9\\/:\-_. ]+/g;

function toLowerCase(x: string) {
  return x.toLowerCase();
}

/**
 * Case insensitive file systems have discrepancies in how they handle some characters (eg. turkish Upper case I with dot on top - \\u0130)
 * This function is used in places where we want to make file name as a key on these systems
 * It is possible on mac to be able to refer to file name with I with dot on top as a fileName with its lower case form
 * But on windows we cannot. Windows can have fileName with I with dot on top next to its lower case and they can not each be referred with the lowercase forms
 * Technically we would want this function to be platform specific as well but
 * our api has till now only taken caseSensitive as the only input and just for some characters we don't want to update API and ensure all customers use those api
 * We could use upper case and we would still need to deal with the discrepancies but
 * we want to continue using lower case since in most cases filenames are lower case and wont need any case changes and avoid having to store another string for the key
 * So for this function purpose, we go ahead and assume character I with dot on top it as case sensitive since its very unlikely to use lower case form of that special character
 *
 * @internal
 */
export function toFileNameLowerCase(x: string): string {
  return FILENAME_LOWERCASE_REGEX.test(x)
    ? x.replace(FILENAME_LOWERCASE_REGEX, toLowerCase)
    : x;
}

export interface CheckAbsoluteOptions {
  type?: "file" | "directory";
}

/**
 * Check if the request is an absolute path and if it exists in the file system.
 *
 * @param request - The request path to check.
 * @param vfs - The file system module to use for checking file existence.
 * @returns The file path if it exists, otherwise false.
 */
export function checkAbsolute(
  request: string,
  vfs: VirtualFileSystemInterface
): string | false {
  // if it's not a absolute path
  if (!isAbsolutePath(request)) {
    return false;
  }

  // if (options.type === "directory") {
  //   return vfs.directoryExistsSync(request) ? request : false;
  // }

  // if (options.type === "file" && vfs.fileExistsSync(request)) {
  //   return request;
  // }

  if (vfs.pathExistsSync(request)) {
    return request;
  }

  const result = checkVariants(request, vfs);
  if (result) {
    return result;
  }

  return false;
}

export interface CheckRelativeOptions extends CheckAbsoluteOptions {
  parentPath?: string;
}

/**
 * Check if the request is a relative path and if it exists in the given paths.
 *
 * @param context - The context of the virtual file system.
 * @param request - The request path to check.
 * @param vfs - The file system module to use for checking file existence.
 * @param options - Options to specify the type of path to check (file or directory) and the parent path.
 * @returns The file path if it exists, otherwise false.
 */
export function checkRelative(
  context: Context,
  request: string,
  vfs: VirtualFileSystemInterface,
  options: CheckRelativeOptions = {}
): string | false {
  const file: string | false = options.parentPath
    ? joinPaths(options.parentPath, request)
    : request;

  // if (options.type === "directory") {
  //   return vfs.directoryExistsSync(file) ? file : false;
  // }

  // if (options.type === "file" && vfs.fileExistsSync(file)) {
  //   return file;
  // }

  if (vfs.pathExistsSync(file)) {
    return file;
  }

  const result = checkVariants(request, vfs, options.parentPath);
  if (result) {
    return result;
  }

  return false;
}

/**
 * Check if the file exists with different variants (index, extensions).
 *
 * @param request - The request path to check.
 * @param vfs - The file system module to use for checking file existence.
 * @returns The file path if it exists, otherwise false.
 */
export function checkVariants(
  request: string,
  vfs: VirtualFileSystemInterface,
  parentPath?: string
): string | false {
  const path = parentPath ? joinPaths(parentPath, request) : request;

  let file = checkExtensions(path, vfs);
  if (file) {
    return file;
  }

  file = checkIndex(path, vfs);
  if (file) {
    return file;
  }

  return false;
}

/**
 * Check if the index file exists in the given request path.
 *
 * @param request - The request path to check.
 * @param vfs - The file system module to use for checking file existence.
 * @returns The index file path if it exists, otherwise false.
 */
export function checkIndex(
  request: string,
  vfs: VirtualFileSystemInterface
): string | false {
  let file: string | false = joinPaths(request, "index");
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = checkExtensions(file, vfs);
  if (file) {
    return file;
  }

  return false;
}

/**
 * Check if the file exists with different extensions.
 *
 * @param request - The request path to check.
 * @param vfs - The file system module to use for checking file existence.
 * @returns The file path if it exists with any of the checked extensions, otherwise false.
 */
export function checkExtensions(
  request: string,
  vfs: VirtualFileSystemInterface
): string | false {
  let file = `${request}.ts`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.mts`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.cts`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.tsx`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.js`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.mjs`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.cjs`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.jsx`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.json`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  file = `${request}.d.ts`;
  if (vfs.fileExistsSync(file)) {
    return file;
  }

  return false;
}
