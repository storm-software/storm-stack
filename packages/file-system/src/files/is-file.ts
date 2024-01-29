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
  return !!lstatSync(additionalPath ? joinPaths(additionalPath, path) : path)?.isFile();
};

/**
 * Check if the given path is a directory
 *
 * @param path - The location to check
 * @param additionalPath - An optional additional path to add to the start of the path
 * @returns An indicator specifying if the file is a directory
 */
export const isDirectory = (path: string, additionalPath?: string): boolean => {
  return !!lstatSync(additionalPath ? joinPaths(additionalPath, path) : path).isDirectory();
};
