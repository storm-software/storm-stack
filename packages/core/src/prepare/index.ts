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
import { StormJSON } from "@stryke/json/storm-json";
import { joinPaths } from "@stryke/path/join-paths";
import { getParsedTypeScriptConfig } from "../helpers/utilities/tsconfig";
import { writeFile } from "../helpers/utilities/write-file";
import type { Context, EngineHooks, Options } from "../types/build";
import type { LogFn } from "../types/config";
import { prepareDirectories } from "./directories";
import { prepareReflections } from "./reflections";
import { prepareRuntime } from "./runtime";
import { prepareTypes } from "./types";

export async function prepare<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  await writeFile(
    log,
    joinPaths(context.options.projectRoot, context.artifactsDir, "meta.json"),
    StormJSON.stringify(context.meta)
  );
  context.persistedMeta = context.meta;

  await hooks.callHook("prepare:begin", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while starting the prepare process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting the prepare process for the Storm Stack project",
      { cause: error }
    );
  });

  await prepareDirectories(log, context, hooks);
  await prepareReflections(log, context, hooks);
  await prepareTypes(log, context, hooks);

  if (context.options.projectType === "application") {
    await context.unimport.dumpImports();

    await prepareRuntime(log, context, hooks);

    await hooks.callHook("prepare:entry", context).catch((error: Error) => {
      log(
        LogLevelLabel.ERROR,
        `An error occured while creating entry artifacts: ${error.message} \n${error.stack ?? ""}`
      );

      throw new Error("An error occured while creating entry artifacts", {
        cause: error
      });
    });

    await hooks.callHook("prepare:deploy", context).catch((error: Error) => {
      log(
        LogLevelLabel.ERROR,
        `An error occured while creating deployment artifacts: ${error.message} \n${error.stack ?? ""}`
      );

      throw new Error("An error occured while creating deployment artifacts", {
        cause: error
      });
    });
  }

  await hooks.callHook("prepare:misc", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while creating miscellaneous artifacts: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error("An error occured while creating miscellaneous artifacts", {
      cause: error
    });
  });

  // Re-resolve the tsconfig to ensure it is up to date
  context.tsconfig = await getParsedTypeScriptConfig(context);
  if (!context.tsconfig) {
    throw new Error("Failed to parse the TypeScript configuration file.");
  }

  await hooks.callHook("prepare:complete", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while finishing the prepare process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing the prepare process for the Storm Stack project",
      { cause: error }
    );
  });
}
