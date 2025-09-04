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
import { Context } from "../../types/context";
import { docsApiReference } from "./api-reference";

/**
 * Generates documentation for the Storm Stack project based on the provided context and hooks.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function docs<TContext extends Context = Context>(
  context: TContext,
  hooks: EngineHooks<TContext>
) {
  await hooks.callHook("docs:begin", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while starting to generate documentation for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting to generate documentation for the Storm Stack project",
      { cause: error }
    );
  });

  await docsApiReference(context, hooks);

  await hooks.callHook("docs:complete", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while finishing generation of documentation for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing generation of documentation for the Storm Stack project",
      { cause: error }
    );
  });
}
