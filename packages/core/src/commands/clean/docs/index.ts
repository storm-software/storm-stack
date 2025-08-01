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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { joinPaths } from "@stryke/path/join-paths";
import type { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";

/**
 * Cleans the Storm Stack project generated documentation.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function cleanDocs(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Cleaning the Storm Stack project generated documentation.`
  );

  await context.vfs.rm(
    joinPaths(
      context.options.workspaceRoot,
      context.options.output.outputPath || "dist/docs"
    )
  );

  await hooks.callHook("clean:docs", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while cleaning the Storm Stack project generated documentation: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while cleaning the Storm Stack project generated documentation",
      {
        cause: error
      }
    );
  });
}
