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
import type { Context, EngineHooks } from "../../types/build";
import type { LogFn } from "../../types/config";
import { getNodeDeps } from "./node";
import { getSharedDeps } from "./shared";
import { installPackage } from "./utilities";

/**
 * Installs missing project dependencies.
 *
 * @param log - The logger function.
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function initInstalls(
  log: LogFn,
  context: Context,
  hooks: EngineHooks
): Promise<void> {
  log(
    LogLevelLabel.TRACE,
    `Checking and installing missing project dependencies.`
  );

  context.installs = getSharedDeps(context);
  if (context.options.platform === "node") {
    const installs = getNodeDeps(context);
    context.installs = Object.keys(installs).reduce((ret, key) => {
      if (installs[key] && ret[key] !== "dependency") {
        ret[key] = installs[key];
      }

      return ret;
    }, context.installs);
  }

  await hooks.callHook("init:installs", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while installing project dependencies: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error("An error occured while installing project dependencies", {
      cause: error
    });
  });

  log(
    LogLevelLabel.TRACE,
    `The following packages must be installed as dependencies: \n${Object.keys(
      context.installs
    )
      .map(key => ` - ${key} (${context.installs[key]})`)
      .join("\n")}`
  );

  for (const [key, value] of Object.entries(context.installs)) {
    await installPackage(log, context, key, value === "devDependency");
  }
}
