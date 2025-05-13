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
import { removeDirectory } from "@stryke/fs/helpers";
import { joinPaths } from "@stryke/path/join-paths";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function cleanDocs<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Cleaning the Storm Stack project generated documentation.`
  );

  await removeDirectory(
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.outputPath!
    )
  );

  await hooks.callHook("clean:docs", context).catch((error: Error) => {
    log(
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
