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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { joinPaths } from "@stryke/path/join-paths";
import type { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";

/**
 * Cleans the Storm Stack project output by removing generated files and directories.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function cleanOutput(context: Context, hooks: EngineHooks) {
  context.log(LogLevelLabel.TRACE, `Cleaning the Storm Stack project output.`);

  await context.vfs.rm(
    joinPaths(context.options.workspaceRoot, context.options.output.outputPath)
  );

  await hooks.callHook("clean:output", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while cleaning the Storm Stack project output: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while cleaning the Storm Stack project output",
      {
        cause: error
      }
    );
  });
}
