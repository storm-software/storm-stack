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
import { Compiler } from "../../base/compiler";
import { createUnimport } from "../../lib/unimport";
import type { EngineHooks } from "../../types/build";
import { SourceFile } from "../../types/compiler";
import { Context } from "../../types/context";
import { __VFS_INIT__ } from "../../types/vfs";
import { initEntry } from "./entry";
import { initInstall } from "./install";
import { initOptions } from "./options";
import { initReflections } from "./reflections";
import { initTsconfig } from "./tsconfig";

/**
 * Initializes the Storm Stack project.
 *
 * @param context - The context containing options and environment paths.
 * @param hooks - The engine hooks to call during initialization.
 * @returns A promise that resolves when the initialization is complete.
 */
export async function init<TContext extends Context = Context>(
  context: TContext,
  hooks: EngineHooks<TContext>
) {
  await hooks.callHook("init:begin", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while starting initialization for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting initialization for the Storm Stack project",
      { cause: error }
    );
  });

  context.unimport = createUnimport(context);
  await context.unimport.init();

  await initOptions(context, hooks);
  await initInstall(context, hooks);
  await initTsconfig(context, hooks);

  const handlePreTransform = async (
    context: TContext,
    sourceFile: SourceFile
  ) => {
    await hooks
      .callHook("build:pre-transform", context, sourceFile)
      .catch((error: Error) => {
        context.log(
          LogLevelLabel.ERROR,
          `An error occured while pre-transforming the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while pre-transforming the Storm Stack project",
          { cause: error }
        );
      });

    return sourceFile;
  };

  const handlePostTransform = async (
    context: TContext,
    sourceFile: SourceFile
  ) => {
    await hooks
      .callHook("build:post-transform", context, sourceFile)
      .catch((error: Error) => {
        context.log(
          LogLevelLabel.ERROR,
          `An error occured while post-transforming the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while post-transforming the Storm Stack project",
          { cause: error }
        );
      });

    return sourceFile;
  };

  context.compiler = new Compiler(context, {
    onPreTransform: handlePreTransform,
    onPostTransform: handlePostTransform
  });

  await initEntry(context, hooks);
  await initReflections(context, hooks);

  await hooks.callHook("init:complete", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while finishing initialization for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing initialization for the Storm Stack project",
      { cause: error }
    );
  });

  context.vfs[__VFS_INIT__]();
}
