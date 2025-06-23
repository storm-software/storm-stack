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
import { readDotenvReflection } from "../helpers/dotenv/persistence";
import type { Context, EngineHooks } from "../types/build";
import type { LogFn } from "../types/config";
import { buildApplication } from "./application";
import { buildLibrary } from "./library";

export async function build(log: LogFn, context: Context, hooks: EngineHooks) {
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

  context.dotenv.types.config.reflection = await readDotenvReflection(
    context,
    "config"
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
