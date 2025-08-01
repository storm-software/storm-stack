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
import { findFileExtension } from "@stryke/path/file-path-fns";
import { isParentPath } from "@stryke/path/is-parent-path";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import { getFileHeader } from "../../../lib/utilities/file-header";
import type { EngineHooks } from "../../../types/build";
import type { Context } from "../../../types/context";

/**
 * Prepares the runtime artifacts for the Storm Stack project.
 *
 * @remarks
 * This function calls the `prepare:runtime` hook and generates type declarations for runtime artifacts if enabled.
 *
 * @param context - The context containing options and environment paths.
 * @param hooks - The engine hooks to call during preparation.
 * @returns A promise that resolves when the preparation is complete.
 */
export async function prepareRuntime(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Preparing the runtime artifacts for the Storm Stack project.`
  );

  await context.vfs.rm(context.runtimePath);

  await hooks.callHook("prepare:runtime", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occurred while preparing the runtime artifacts for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while preparing the runtime artifacts for the Storm Stack project",
      { cause: error }
    );
  });

  context.log(LogLevelLabel.TRACE, "Generating runtime barrel file");

  await context.vfs.writeRuntimeFile(
    "index",
    joinPaths(context.runtimePath, "index.ts"),
    `
  ${getFileHeader()}

  ${(await context.vfs.listRuntimeFiles())
    .filter(
      file =>
        !isParentPath(file.path, joinPaths(context.runtimePath, "log")) &&
        !isParentPath(file.path, joinPaths(context.runtimePath, "storage"))
    )
    .map(
      file =>
        `export * from "./${replacePath(file.path, context.runtimePath).replace(findFileExtension(file.path)!, "")}";`
    )
    .join("\n")}
  `
  );

  // await context.unimport.refreshRuntimeImports();
  // await context.unimport.dumpImports();
}
