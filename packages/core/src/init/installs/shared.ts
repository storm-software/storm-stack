/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { Context } from "../../types/build";

/**
 * Get the shared dependencies for the project.
 *
 * @param context - The context object containing the options.
 * @returns An object containing the shared dependencies and their types.
 */
export function getSharedDeps(
  context: Context
): Record<string, "dependency" | "devDependency"> {
  context.installs ??= {};
  context.installs["@storm-stack/types"] = "devDependency";

  if (context.options.projectType === "application") {
    context.installs.unstorage = "dependency";
  }

  return context.installs;
}
