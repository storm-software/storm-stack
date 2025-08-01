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

import type { Context } from "../../../types/context";

/**
 * Get the NodeJs dependencies for the project.
 *
 * @param context - The context object containing the options.
 * @returns An object containing the NodeJs dependencies and their types.
 */
export function getNodeDeps(
  context: Context
): Record<string, "dependency" | "devDependency"> {
  context.packageDeps ??= {};
  context.packageDeps["@types/node"] = "devDependency";

  if (context.options.projectType === "application") {
    context.packageDeps.unctx = "dependency";
  }

  return context.packageDeps;
}
