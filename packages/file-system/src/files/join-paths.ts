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

import { isAbsolute, join } from "node:path";

/**
 * Join the given paths
 *
 * @param paths - The paths to join
 * @returns The joined paths
 */
export const joinPaths = (...paths: string[]): string => {
  const path = join(...paths);

  const result = isAbsolute(path)
    ? path.replaceAll("/", "\\")
    : path.replaceAll("\\", "/");
  return result.startsWith("/C:") ? result.slice(1) : result;
};
