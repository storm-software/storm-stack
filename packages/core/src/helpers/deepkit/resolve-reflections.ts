/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import { joinPaths } from "@stryke/path/join-paths";
import type { Context, Options } from "../../types/build";

/**
 * Returns the path to the reflections artifact directory.
 *
 * @param context - The context object containing the environment paths.
 * @returns The path to the reflections artifact directory.
 */
export function getReflectionsPath<TOptions extends Options = Options>(
  context: Context<TOptions>
): string {
  return joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.projectRoot,
    context.artifactsDir,
    "reflections"
  );
}
