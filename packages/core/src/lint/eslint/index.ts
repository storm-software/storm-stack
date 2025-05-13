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
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";
import { runEslint } from "./lint";

export async function lintEslint<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(LogLevelLabel.TRACE, `Running ESLint on the Storm Stack project.`);

  await runEslint(log, context, {
    lintDuringBuild: true,
    eslintOptions: {
      cacheLocation: joinPaths(context.envPaths.cache, "eslint")
    }
  });

  await hooks.callHook("lint:eslint", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while running ESLint on the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );
    throw new Error(
      "An error occured while running ESLint on the Storm Stack project",
      {
        cause: error
      }
    );
  });
}
