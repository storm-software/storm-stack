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
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import { createWorker } from "../../helpers/utilities/worker";
import type { Context, EngineHooks } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function initWorkers(
  log: LogFn,
  context: Context,
  hooks: EngineHooks
) {
  log(LogLevelLabel.TRACE, "Initializing the Storm Stack worker processes.");

  const packagePath = process.env.STORM_STACK_LOCAL
    ? joinPaths(context.workspaceConfig.workspaceRoot, "dist/packages/core")
    : await resolvePackage("@storm-stack/core");
  if (!packagePath) {
    throw new Error(
      "Could not resolve the Storm Stack core package. Please ensure it is installed."
    );
  }

  context.workers.errorLookup = createWorker(
    joinPaths(packagePath, "workers", "error-lookup.cjs"),
    ["find"]
  );
  context.workers.configReflection = createWorker(
    joinPaths(packagePath, "workers", "config-reflection.cjs"),
    ["add", "clear"]
  );

  await hooks.callHook("init:workers", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the workers used by the Storm Stack build processes: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the workers used by the Storm Stack build processes",
      { cause: error }
    );
  });
}
