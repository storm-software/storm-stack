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
import { parseTypeDefinition } from "@stryke/convert/parse-type-definition";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";
import { resolveEntry } from "./resolve";

export async function initEntry<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing the entry points for the Storm Stack project.`
  );

  if (context.options.projectType === "application" && context.options.entry) {
    if (isSetString(context.options.entry)) {
      context.entry = [
        {
          ...resolveEntry(context, context.options.entry),
          input: parseTypeDefinition(context.options.entry)!
        }
      ];
    } else if (
      Array.isArray(context.options.entry) &&
      context.options.entry.filter(Boolean).length > 0
    ) {
      context.entry = context.options.entry
        .map(entry => ({
          ...resolveEntry(context, entry),
          input: parseTypeDefinition(entry)!
        }))
        .filter(Boolean);
    }
  }

  await hooks.callHook("init:entry", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the entry points for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the entry points for the Storm Stack project",
      { cause: error }
    );
  });
}
