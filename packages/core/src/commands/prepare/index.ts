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
import { existsSync } from "@stryke/fs/exists";
import { createDirectory } from "@stryke/fs/helpers";
import { writeMetaFile } from "../../lib/context";
import { getParsedTypeScriptConfig } from "../../lib/typescript/tsconfig";
import type { EngineHooks } from "../../types/build";
import type { Context } from "../../types/context";
import { prepareConfig } from "./config";
import { prepareDeploy } from "./deploy";
import { prepareEntry } from "./entry";
import { prepareRuntime } from "./runtime";
import { prepareTypes } from "./types";

/**
 * Prepares the Storm Stack project by generating necessary artifacts and configurations.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function prepare<TContext extends Context = Context>(
  context: TContext,
  hooks: EngineHooks<TContext>
) {
  await writeMetaFile(context);
  context.persistedMeta = context.meta;

  await hooks.callHook("prepare:begin", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while starting the prepare process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting the prepare process for the Storm Stack project",
      { cause: error }
    );
  });

  if (!existsSync(context.cachePath)) {
    await createDirectory(context.cachePath);
  }

  if (!existsSync(context.dataPath)) {
    await createDirectory(context.dataPath);
  }

  await prepareConfig(context, hooks);

  if (context.options.projectType === "application") {
    await prepareRuntime(context, hooks);
  }

  if (context.options.output.dts !== false) {
    await prepareTypes(context, hooks);
  }

  if (context.options.projectType === "application") {
    await prepareEntry(context, hooks);
  }

  await prepareDeploy(context, hooks);

  // Re-resolve the tsconfig to ensure it is up to date
  context.tsconfig = getParsedTypeScriptConfig(
    context.options.workspaceRoot,
    context.options.projectRoot,
    context.options.tsconfig
  );
  if (!context.tsconfig) {
    throw new Error("Failed to parse the TypeScript configuration file.");
  }

  await hooks.callHook("prepare:complete", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while finishing the prepare process for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing the prepare process for the Storm Stack project",
      { cause: error }
    );
  });

  await writeMetaFile(context);

  // await compressDirectory(
  //   joinPaths(context.options.projectRoot, context.artifactsDir),
  //   {
  //     destination: joinPaths(
  //       context.envPaths.cache,
  //       context.options.projectRoot,
  //       `${context.meta.checksum}.tar.gz`
  //     )
  //   }
  // );
}
