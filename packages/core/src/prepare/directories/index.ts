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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { createDirectory } from "@stryke/fs/helpers";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import type { Context, EngineHooks } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function prepareDirectories(
  log: LogFn,
  context: Context,
  hooks: EngineHooks
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the artifact directories for the Storm Stack project.`
  );

  if (!existsSync(joinPaths(context.artifactsPath))) {
    await createDirectory(joinPaths(context.artifactsPath));
  }

  if (context.options.projectType === "application") {
    if (!existsSync(context.runtimePath)) {
      await createDirectory(context.runtimePath);
    }
  }

  if (!existsSync(context.dataPath)) {
    await createDirectory(context.dataPath);
  }

  await hooks.callHook("prepare:directories", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while preparing the artifact directories for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while preparing the artifact directories for the Storm Stack project",
      { cause: error }
    );
  });
}
