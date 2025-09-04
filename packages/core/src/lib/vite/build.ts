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

import { build } from "vite";
import { ViteOptions } from "../../types/config";
import { Context } from "../../types/context";
import { resolveViteOptions } from "./options";

/**
 * Build the project using [vite](https://vitejs.dev/)
 *
 * @param context - The context of the build
 * @param options - The override options for the build
 */
export async function vite(
  context: Context,
  options: Partial<ViteOptions> = {}
) {
  await build({
    ...resolveViteOptions(context, options),
    ...(context.options.variant === "vite" ? context.options.override : {})
  });
}
