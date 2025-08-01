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

import { build } from "@storm-software/unbuild";
import { UnbuildOverrideOptions } from "../../types/config";
import type { Context } from "../../types/context";
import { resolveUnbuildOptions } from "./options";

/**
 * Build the project using unbuild
 *
 * @param context - The context object
 * @returns A promise that resolves when the build is complete
 */
export async function unbuild(
  context: Context,
  override: Partial<UnbuildOverrideOptions> = {}
) {
  const options = resolveUnbuildOptions(context, override);

  return build(options);
}
