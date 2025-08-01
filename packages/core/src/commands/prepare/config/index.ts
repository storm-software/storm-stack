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
import { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";

/**
 * Prepares the configuration for the Storm Stack project.
 *
 * @remarks
 * This function initializes the context for the Storm Stack project and prepares the configuration.
 * It calls the `prepare:config` hook to allow plugins to modify the configuration.
 *
 * @param context - The context containing options and environment paths.
 * @param hooks - The engine hooks to call during preparation.
 * @throws An error if an issue occurs while preparing the configuration.
 */
export async function prepareConfig(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Preparing the configuration for the Storm Stack project.`
  );

  await hooks.callHook("prepare:config", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occurred while preparing the configuration for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while preparing the configuration for the Storm Stack project",
      { cause: error }
    );
  });
}
