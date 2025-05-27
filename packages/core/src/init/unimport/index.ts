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
import type { InlinePreset } from "unimport";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";
import { createUnimport } from "./create";

/**
 * Initialize Unimport for the Storm Stack project.
 *
 * @param log - The logger function to use for logging.
 * @param context - The context object for the project.
 * @param hooks - The hooks object for the project.
 */
export async function initUnimport<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing Unimport for the Storm Stack project.`
  );

  const runtimeDir = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    context.artifactsDir,
    "runtime"
  );
  context.unimportPresets = [
    {
      imports: ["StormError", "createStormError", "isError", "isStormError"],
      from: joinPaths(runtimeDir, "error")
    },
    {
      imports: ["StormPayload"],
      from: joinPaths(runtimeDir, "payload")
    },
    {
      imports: ["StormResult"],
      from: joinPaths(runtimeDir, "result")
    },
    {
      imports: ["StormLog"],
      from: joinPaths(runtimeDir, "log")
    },
    {
      imports: ["uniqueId", "getRandom"],
      from: joinPaths(runtimeDir, "id")
    },
    {
      imports: ["storage"],
      from: joinPaths(runtimeDir, "storage")
    }
  ];

  if (context.options.platform === "node") {
    context.unimportPresets.push({
      imports: ["withContext"],
      from: joinPaths(runtimeDir, "app")
    });
    context.unimportPresets.push({
      imports: ["useStorm", "STORM_ASYNC_CONTEXT"].filter(
        Boolean
      ) as InlinePreset["imports"],
      from: joinPaths(runtimeDir, "context")
    });
    context.unimportPresets.push({
      imports: ["getEnvPaths", "getBuildInfo", "getRuntimeInfo"].filter(
        Boolean
      ) as InlinePreset["imports"],
      from: joinPaths(runtimeDir, "env")
    });
    context.unimportPresets.push({
      imports: ["StormEvent"],
      from: joinPaths(runtimeDir, "event")
    });
  }

  await hooks.callHook("init:unimport", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while initializing Unimport for the Storm Stack project configuration: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while initializing Unimport for the Storm Stack project configuration",
      { cause: error }
    );
  });

  context.unimport = createUnimport<TOptions>(log, context);
  await context.unimport.init();
}
