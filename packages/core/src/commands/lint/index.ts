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
import type { EngineHooks } from "../../types/build";
import type { Context } from "../../types/context";
import { lintEslint } from "./eslint";
import { lintTypes } from "./types";

/**
 * Lints the Storm Stack project based on the provided context and hooks.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function lint(context: Context, hooks: EngineHooks) {
  await hooks.callHook("lint:begin", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while starting the lint process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting the lint process for the Storm Stack project",
      { cause: error }
    );
  });

  await lintTypes(context, hooks);
  await lintEslint(context, hooks);

  await hooks.callHook("lint:complete", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while finishing the lint process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing the lint process for the Storm Stack project",
      { cause: error }
    );
  });
}
