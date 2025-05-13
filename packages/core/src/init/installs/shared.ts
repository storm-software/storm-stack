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

import type { Context, Options } from "../../types/build";

/**
 * Get the shared dependencies for the project.
 *
 * @param context - The context object containing the options.
 * @returns An object containing the shared dependencies and their types.
 */
export function getSharedDeps<TOptions extends Options = Options>(
  context: Context<TOptions>
): Record<string, "dependency" | "devDependency"> {
  const result = {
    "@stryke/types": "devDependency",
    "@storm-stack/types": "devDependency"
  } as Record<string, "dependency" | "devDependency">;

  if (context.options.projectType === "application") {
    result["@stryke/type-checks"] = "dependency";
    result["@stryke/json"] = "dependency";
    result["@stryke/url"] = "dependency";
    result["@stryke/http"] = "dependency";
    result.unstorage = "dependency";
  }

  return result;
}
