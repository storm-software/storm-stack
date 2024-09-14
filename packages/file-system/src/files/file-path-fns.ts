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

import { EMPTY_STRING } from "@storm-stack/types";
import { dirname, isAbsolute, parse, relative, sep } from "node:path";
import { getWorkspaceRoot } from "./get-workspace-root";
import { joinPaths } from "./join-paths";

/**
 * Find the file name from a file path.
 *
 * @param filePath - The file path to process
 * @returns The file name
 */
export function findFileName(filePath: string): string {
  return (
    filePath
      ?.split(
        filePath?.includes(sep) ? sep : filePath?.includes("/") ? "/" : "\\"
      )
      ?.pop() ?? ""
  );
}

/**
 * Find the file path from a file path.
 * @param filePath - The file path to process
 * @returns The file path
 */
export function findFilePath(filePath: string): string {
  return filePath.replace(findFileName(filePath), "");
}

/**
 * Find the file extension from a file path.
 *
 * @param filePath - The file path to process
 * @returns The file extension
 */
export function findFileExtension(filePath: string): string {
  const splits = findFileName(filePath)?.split(".");
  if (splits && Array.isArray(splits) && splits.length > 0) {
    splits.pop();
  }

  return splits.join(".") ?? EMPTY_STRING;
}

/**
 * Find the folder containing the file.
 *
 * @remarks
 * Example: `C:\Users\user\Documents\file.txt` would return `Documents`
 *
 * @param filePath - The file path to process
 * @returns The file path
 */
export function findContainingFolder(filePath: string): string {
  let folderPath = findFilePath(filePath);
  if (
    folderPath.lastIndexOf("\\") === folderPath.length - 1 ||
    folderPath.lastIndexOf("/") === folderPath.length - 1
  ) {
    folderPath = folderPath.slice(0, Math.max(0, folderPath.length - 1));
  }

  return folderPath.split("\\").pop() ?? EMPTY_STRING;
}

/**
 * Check if a file path has a file name.
 *
 * @param filePath - The file path to process
 * @returns An indicator specifying if the file path has a file name
 */
export function hasFileName(filePath: string): boolean {
  return Boolean(findFileName(filePath));
}

/**
 * Check if a file path has a file path.
 *
 * @param filePath - The file path to process
 * @returns An indicator specifying if the file path has a file path
 */
export function hasFilePath(filePath: string): boolean {
  return Boolean(findFilePath(filePath));
}

/**
 * Resolve the file path to an absolute path.
 *
 * @param filePath - The file path to process
 * @param basePath - The base path to use when resolving the file path
 * @returns The resolved file path
 */
export function resolvePath(
  filePath: string,
  basePath: string = getWorkspaceRoot()
) {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  if (basePath) {
    return joinPaths(dirname(basePath), filePath);
  }
  return joinPaths(process.cwd(), filePath);
}

/**
 * Find the file path relative to the workspace root path.
 *
 * @param filePath - The file path to process
 * @param basePath - The base path to use when resolving the file path
 * @returns The resolved file path
 */
export function relativeToWorkspaceRoot(filePath: string) {
  return relative(filePath, getWorkspaceRoot());
}

/**
 * Rename the file name with a new name.
 *
 * @param filePath - The current file path being processed
 * @param newFileName - The updated file name being processed
 * @returns The modified or unmodified file path.
 */
export function renameFile(filePath: string, newFileName: string): string {
  const file = parse(filePath);
  return joinPaths(
    file.dir,
    newFileName.includes(".") ? newFileName : newFileName + file.ext
  );
}
