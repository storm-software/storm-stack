import { dirname, isAbsolute, join, parse, sep } from "node:path";
import { getWorkspaceRoot } from "./get-workspace-root";

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
 * Resolve the file path to an absolute path.
 *
 * @param filePath - The file path to process
 * @param basePath - The base path to use when resolving the file path
 * @returns The resolved file path
 */
export function resolvePath(filePath: string, basePath?: string) {
  if (isAbsolute(filePath)) {
    return filePath;
  } else if (basePath) {
    return join(dirname(basePath), filePath);
  } else {
    const workspaceRoot = getWorkspaceRoot();
    if (workspaceRoot) {
      return join(workspaceRoot, filePath);
    }

    return join(process.cwd(), filePath);
  }
}

/**
 * Rename the file name with a new name.
 *
 * @param filePath The current file path being processed
 * @param newFileName The updated file name being processed
 * @returns The modified or unmodified file path.
 */
export function renameFile(filePath: string, newFileName: string): string {
  const file = parse(filePath);
  return join(
    file.dir,
    newFileName.includes(".") ? newFileName : newFileName + file.ext
  );
}
