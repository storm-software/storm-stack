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

import type { UnbuildOptions } from "@storm-software/unbuild";
import { build } from "@storm-software/unbuild";
import type { Context, Options } from "@storm-stack/core/types/build";
import defu from "defu";
import { getUnbuildLoader } from "./loader";

/**
 * Build the project using unbuild
 *
 * @param context - The context object
 * @returns A promise that resolves when the build is complete
 */
export async function unbuild<TOptions extends Options = Options>(
  context: Context<TOptions>,
  override: Partial<UnbuildOptions> = {}
) {
  return build(
    defu(override, context.override ?? {}, {
      projectRoot: context.options.projectRoot,
      outputPath: context.options.outputPath || "dist",
      platform: context.options.platform,
      generatePackageJson: true,
      minify: context.options.mode !== "development",
      sourcemap: context.options.mode === "development",
      loaders: [getUnbuildLoader<TOptions>(context)],
      env: context.dotenv.values as {
        [key: string]: string;
      }
    }) as UnbuildOptions
  );
}
