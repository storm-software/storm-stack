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
import { writeDotenvReflection } from "../../helpers/dotenv/persistence";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function initReflections<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing the reflection data for the Storm Stack project.`
  );

  // const configReflectionFile = getDotenvReflectionsPath(context);
  // if (existsSync(configReflectionFile)) {
  //   await removeFile(configReflectionFile);
  // }

  // const secretsReflectionFile = getDotenvReflectionsPath(context, "secrets");
  // if (existsSync(secretsReflectionFile)) {
  //   await removeFile(secretsReflectionFile);
  // }

  await writeDotenvReflection(
    context,
    context.dotenv.types.config.reflection,
    "config"
  );

  if (context.dotenv.types.secrets?.reflection) {
    await writeDotenvReflection(
      context,
      context.dotenv.types.secrets?.reflection,
      "secrets"
    );
  }

  await hooks.callHook("init:reflections", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the reflection data for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the reflection data for the Storm Stack project",
      { cause: error }
    );
  });
}
