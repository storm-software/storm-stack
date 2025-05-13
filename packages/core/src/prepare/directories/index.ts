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
import { createDirectory } from "@stryke/fs/helpers";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function prepareDirectories<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the artifact directories for the Storm Stack project.`
  );

  if (
    !existsSync(joinPaths(context.options.projectRoot, context.artifactsDir))
  ) {
    await createDirectory(
      joinPaths(context.options.projectRoot, context.artifactsDir)
    );
  }

  if (context.options.projectType === "application") {
    if (
      !existsSync(
        joinPaths(context.options.projectRoot, context.artifactsDir, "runtime")
      )
    ) {
      await createDirectory(
        joinPaths(context.options.projectRoot, context.artifactsDir, "runtime")
      );
    }
  }

  if (
    !existsSync(
      joinPaths(context.options.projectRoot, context.artifactsDir, "types")
    )
  ) {
    await createDirectory(
      joinPaths(context.options.projectRoot, context.artifactsDir, "types")
    );
  }

  if (
    !existsSync(
      joinPaths(
        context.options.projectRoot,
        context.artifactsDir,
        "reflections"
      )
    )
  ) {
    await createDirectory(
      joinPaths(
        context.options.projectRoot,
        context.artifactsDir,
        "reflections"
      )
    );
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
