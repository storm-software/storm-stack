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
import { resolveDotenvReflection } from "../helpers/dotenv/resolve";
import type { Context, EngineHooks, Options } from "../types/build";
import type { LogFn } from "../types/config";
import { buildApplication } from "./application";
import { buildLibrary } from "./library";

export async function build<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  await hooks.callHook("build:begin", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while starting the build process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting the build process for the Storm Stack project",
      { cause: error }
    );
  });

  context.dotenv.types.variables.reflection = await resolveDotenvReflection(
    context,
    "variables",
    true
  );

  if (context.options.projectType === "application") {
    await buildApplication(log, context, hooks);
  } else {
    await buildLibrary(log, context, hooks);
  }

  await hooks.callHook("build:complete", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while finishing the build process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing the build process for the Storm Stack project",
      { cause: error }
    );
  });
}
