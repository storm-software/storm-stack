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

import { lstatSync } from "node:fs";
import { joinPaths } from "./join-paths";

/**
 * Check if the given path is a file
 *
 * @param path - The location to check
 * @param additionalPath - An optional additional path to add to the start of the path
 * @returns An indicator specifying if the file is a file
 */
export const isFile = (path: string, additionalPath?: string): boolean => {
  return Boolean(
    lstatSync(additionalPath ? joinPaths(additionalPath, path) : path)?.isFile()
  );
};

/**
 * Check if the given path is a directory
 *
 * @param path - The location to check
 * @param additionalPath - An optional additional path to add to the start of the path
 * @returns An indicator specifying if the file is a directory
 */
export const isDirectory = (path: string, additionalPath?: string): boolean => {
  return Boolean(
    lstatSync(
      additionalPath ? joinPaths(additionalPath, path) : path
    ).isDirectory()
  );
};
