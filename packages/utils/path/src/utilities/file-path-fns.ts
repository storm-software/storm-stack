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

import { EMPTY_STRING } from "@storm-stack/types/utility-types/base";
import { dirname, isAbsolute, parse, relative, sep } from "node:path";
import { getWorkspaceRoot } from "../workspace/get-workspace-root";
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
 * Find the full file path's directories from a file path.
 *
 * @example
 * const folderPath = findFilePath("C:\\Users\\user\\Documents\\file.txt");
 * // folderPath = "C:\\Users\\user\\Documents"
 *
 * @param filePath - The file path to process
 * @returns The full file path's directories
 */
export function findFilePath(filePath: string): string {
  return filePath.replace(findFileName(filePath), "");
}

/**
 * Find the top most folder containing the file from a file path.
 *
 * @remarks
 * If you're looking for the full path of the folder (for example: `C:\\Users\\user\\Documents` instead of just `Documents`) containing the file, use {@link findFilePath} instead.
 *
 * @example
 * const folderPath = findFolderName("C:\\Users\\user\\Documents\\file.txt");
 * // folderPath = "Documents"
 *
 * @param filePath - The file path to process
 * @returns The folder containing the file
 */
export function findFolderName(filePath: string): string {
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

  return joinPaths(dirname(basePath), filePath);
}

/**
 * Find the file path relative to the workspace root path.
 *
 * @param filePath - The file path to process
 * @param basePath - The base path to use when resolving the file path
 * @returns The resolved file path
 */
export function relativeToWorkspaceRoot(filePath: string) {
  return relative(filePath, getWorkspaceRoot() as string);
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
