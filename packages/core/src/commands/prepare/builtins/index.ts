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
import { findFileExtensionSafe } from "@stryke/path/file-path-fns";
import { isParentPath } from "@stryke/path/is-parent-path";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import { getFileHeader } from "../../../lib/utilities/file-header";
import type { EngineHooks } from "../../../types/build";
import type { Context } from "../../../types/context";

/**
 * Prepares the builtin runtime artifacts for the Storm Stack project.
 *
 * @remarks
 * This function calls the `prepare:builtins` hook and generates type declarations for builtin artifacts if enabled.
 *
 * @param context - The context containing options and environment paths.
 * @param hooks - The engine hooks to call during preparation.
 * @returns A promise that resolves when the preparation is complete.
 */
export async function prepareBuiltins(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Preparing the built-in runtime modules for the Storm Stack project.`
  );

  await context.vfs.rm(context.builtinsPath);

  await hooks.callHook("prepare:builtins", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occurred while generating the built-in runtime modules for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while preparing the built-in runtime modules for the Storm Stack project",
      { cause: error }
    );
  });

  context.log(LogLevelLabel.TRACE, "Generating built-in barrel file");

  await context.vfs.writeBuiltinFile(
    "index",
    joinPaths(context.builtinsPath, "index.ts"),
    `
  ${getFileHeader()}

  ${(await context.vfs.listBuiltinFiles())
    .filter(
      file =>
        !isParentPath(file.path, joinPaths(context.builtinsPath, "log")) &&
        !isParentPath(file.path, joinPaths(context.builtinsPath, "storage"))
    )
    .map(
      file =>
        `export * from "./${replacePath(
          file.path,
          context.builtinsPath
        ).replace(`.${findFileExtensionSafe(file.path)}`, "")}";`
    )
    .join("\n")}
  `
  );

  // await context.unimport.refreshRuntimeImports();
  // await context.unimport.dumpImports();
}
