/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { resolve } from "node:path";
import { isDirectory, isFile } from "./is-file";
import { joinPaths } from "./join-paths";

/**
 * Resolve the parent path of the provided path.
 *
 * @param path - The path to resolve.
 * @returns The parent path of the provided path.
 */
export const resolveParentPath = (path: string): string => {
  return resolve(path, "..");
};

/**
 * Options for the `getParentPath` function.
 */
export interface GetParentPathOptions {
  /**
   * Whether to ignore the case of the file names when checking for existence.
   *
   * @defaultValue true
   */
  ignoreCase: boolean;

  /**
   * Whether to skip the current working directory when checking for the file.
   *
   * @defaultValue false
   */
  skipCwd: boolean;

  /**
   * The type of target to look for.
   *
   * @defaultValue "both"
   */
  targetType: "file" | "directory" | "both";
}

/**
 * Get the first parent path that has a file or directory with the provided name.
 *
 * @param name - The name (or names) of the file to look for in the parent paths.
 * @param cwd - The current working directory.
 * @returns The first parent path that exists.
 */
export const getParentPath = (
  name: string | string[],
  cwd: string,
  options?: Partial<GetParentPathOptions>
): string | undefined => {
  const ignoreCase = options?.ignoreCase ?? true;
  const skipCwd = options?.skipCwd ?? false;
  const targetType = options?.targetType ?? "both";

  let dir = cwd;
  if (skipCwd) {
    dir = resolveParentPath(cwd);
  }

  let names = Array.isArray(name) ? name : [name];
  if (ignoreCase) {
    names = names.map(name => name.toLowerCase());
  }

  while (true) {
    const target = names.find(
      name =>
        (isFile(joinPaths(dir, name)) &&
          (targetType === "file" || targetType === "both")) ||
        (isDirectory(joinPaths(dir, name)) &&
          (targetType === "directory" || targetType === "both"))
    );
    if (target) {
      return joinPaths(dir, target);
    }

    const parentDir = resolve(dir);
    if (parentDir === dir) {
      // It'll fail anyway
      return undefined;
    }
    dir = parentDir;
  }
};
