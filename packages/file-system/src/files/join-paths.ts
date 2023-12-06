import { isAbsolute, join } from "node:path";

/**
 * Join the given paths
 *
 * @param paths - The paths to join
 * @returns The joined paths
 */
export const joinPaths = (...paths: string[]): string => {
  const path = join(...paths);

  return isAbsolute(path)
    ? path.replaceAll("/", "\\")
    : `/${path.replaceAll("\\", "/")}`;
};
