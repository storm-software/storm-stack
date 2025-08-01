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
import type { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";
import { getNodeDeps } from "./node";
import { getSharedDeps } from "./shared";
import { installPackage } from "./utilities";

/**
 * Install missing project dependencies.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function initInstall(
  context: Context,
  hooks: EngineHooks
): Promise<void> {
  context.log(
    LogLevelLabel.TRACE,
    `Checking and installing missing project dependencies.`
  );

  context.packageDeps = getSharedDeps(context);
  if (context.options.platform === "node") {
    const installs = getNodeDeps(context);
    context.packageDeps = Object.keys(installs).reduce((ret, key) => {
      if (installs[key] && ret[key] !== "dependency") {
        ret[key] = installs[key];
      }

      return ret;
    }, context.packageDeps);
  }

  await hooks.callHook("init:install", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while installing project dependencies: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error("An error occured while installing project dependencies", {
      cause: error
    });
  });

  context.log(
    LogLevelLabel.TRACE,
    `The following packages must be installed as dependencies: \n${Object.keys(
      context.packageDeps
    )
      .map(key => ` - ${key} (${context.packageDeps[key]})`)
      .join("\n")}`
  );

  for (const [key, value] of Object.entries(context.packageDeps)) {
    await installPackage(context, key, value === "devDependency");
  }
}
