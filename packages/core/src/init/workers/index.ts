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
import { resolvePackage } from "@stryke/path/resolve";
import { getVarsReflectionsPath } from "../../helpers/dotenv/resolve";
import { createWorker } from "../../helpers/utilities/worker";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function initWorkers<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing the workers for the Storm Stack project.`
  );

  const packagePath = process.env.STORM_STACK_LOCAL
    ? joinPaths(context.workspaceConfig.workspaceRoot, "dist/packages/core")
    : await resolvePackage("@storm-stack/core");
  if (!packagePath) {
    throw new Error(
      "Could not resolve the Storm Stack core package. Please ensure it is installed."
    );
  }

  context.workers.errorLookup = createWorker<["find"]>(
    joinPaths(packagePath, "workers", "error-lookup.cjs"),
    {
      name: "error-lookup",
      numWorkers: 1,
      exposedMethods: ["find"],
      context: {
        filePath: context.options.errorsFile
      }
    }
  );

  context.workers.commitVars = createWorker<["commit"]>(
    joinPaths(packagePath, "workers", "commit-vars.cjs"),
    {
      name: "commit-vars",
      exposedMethods: ["commit"],
      context: {
        filePath: getVarsReflectionsPath(context, "variables")
      }
    }
  );

  await hooks.callHook("init:workers", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the workers for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the workers for the Storm Stack project",
      { cause: error }
    );
  });
}
