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

import { joinPaths } from "@stryke/path/join-paths";
import type { Context } from "../../types/build";

/**
 * Returns the path to the reflections artifact directory.
 *
 * @param context - The context object containing the environment paths.
 * @returns The path to the reflections artifact directory.
 */
export function getReflectionsPath(context: Context): string {
  return joinPaths(context.dataPath, "reflections");
}
