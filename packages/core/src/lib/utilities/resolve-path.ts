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

import { resolvePackage } from "@stryke/fs/resolve";
import { joinPaths } from "@stryke/path/join-paths";
import type { Context } from "../../types/context";

/**
 * Resolves the path of a file in the workspace or project root.
 *
 * @param context - The context object containing the environment paths.
 * @param file - The file path to resolve.
 * @returns A promise that resolves to the resolved path.
 */
export async function resolvePath(
  context: Context,
  file: string
): Promise<string | undefined> {
  let path = context.vfs.resolvePath(file);
  if (path) {
    return path;
  }

  path = file;
  if (context.vfs.existsSync(path)) {
    return path;
  }

  path = joinPaths(context.options.workspaceConfig.workspaceRoot, file);
  if (context.vfs.existsSync(path)) {
    return path;
  }

  path = joinPaths(
    context.options.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    file
  );
  if (context.vfs.existsSync(path)) {
    return path;
  }

  path = joinPaths(context.options.projectRoot, file);
  if (context.vfs.existsSync(path)) {
    return path;
  }

  return resolvePackage(file, {
    paths: [
      context.options.workspaceConfig.workspaceRoot,
      joinPaths(
        context.options.workspaceConfig.workspaceRoot,
        context.options.projectRoot
      )
    ]
  });
}
