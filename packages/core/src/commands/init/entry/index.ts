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

/**
 * Initializes the entry points for the Storm Stack project.
 *
 * @param context - The resolved options
 * @param hooks - The engine hooks
 */
export async function initEntry(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Initializing the entry points for the Storm Stack project.`
  );

  await hooks.callHook("init:entry", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the entry points for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the entry points for the Storm Stack project",
      { cause: error }
    );
  });

  context.log(
    LogLevelLabel.DEBUG,
    `Storm Stack has initialized ${context.entry.length} entry point(s) for the ${
      context.options.name
    } project: \n${context.entry
      .map(
        entry =>
          `- ${entry.input.file || entry.file}${
            entry.output ? ` -> ${entry.output}` : ""
          }`
      )
      .join(" \n")}`
  );
}
