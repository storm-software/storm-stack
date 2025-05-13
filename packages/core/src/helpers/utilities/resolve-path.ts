/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import type { Context, Options } from "../../types/build";

/**
 * Resolves the path of a file in the workspace or project root.
 *
 * @param context - The context object containing the environment paths.
 * @param file - The file path to resolve.
 * @returns A promise that resolves to the resolved path.
 */
export async function resolvePath<TOptions extends Options = Options>(
  context: Context<TOptions>,
  file: string
): Promise<string | undefined> {
  let path = file;
  if (existsSync(path)) {
    return path;
  }

  path = joinPaths(context.workspaceConfig.workspaceRoot, file);
  if (existsSync(path)) {
    return path;
  }

  path = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    file
  );
  if (existsSync(path)) {
    return path;
  }

  path = joinPaths(context.options.projectRoot, file);
  if (existsSync(path)) {
    return path;
  }

  return resolvePackage(file, {
    paths: [
      context.workspaceConfig.workspaceRoot,
      joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.options.projectRoot
      )
    ]
  });
}
