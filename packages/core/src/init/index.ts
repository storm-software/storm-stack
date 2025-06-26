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
import { Compiler } from "../base/compiler";
import type { Context, EngineHooks, SourceFile } from "../types/build";
import type { LogFn } from "../types/config";
import { initContext } from "./context";
import { initDotenv } from "./dotenv";
import { initEntry } from "./entry";
import { initInstalls } from "./installs";
import { initOptions } from "./options";
import { initTsconfig } from "./tsconfig";
import { initUnimport } from "./unimport";
import { initWorkers } from "./workers";

export async function init(log: LogFn, context: Context, hooks: EngineHooks) {
  await hooks.callHook("init:begin", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while starting initialization for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting initialization for the Storm Stack project",
      { cause: error }
    );
  });

  await initContext(log, context, hooks);
  await initOptions(log, context, hooks);
  await initInstalls(log, context, hooks);
  await initTsconfig(log, context, hooks);
  await initUnimport(log, context, hooks);

  const handlePreTransform = async (
    context: Context,
    sourceFile: SourceFile
  ) => {
    await hooks
      .callHook("build:pre-transform", context, sourceFile)
      .catch((error: Error) => {
        log(
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

  const handleTransform = async (context: Context, sourceFile: SourceFile) => {
    await hooks
      .callHook("build:transform", context, sourceFile)
      .catch((error: Error) => {
        log(
          LogLevelLabel.ERROR,
          `An error occured while transforming the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
        );

        throw new Error(
          "An error occured while transforming the Storm Stack project",
          { cause: error }
        );
      });

    return sourceFile;
  };

  const handlePostTransform = async (
    context: Context,
    sourceFile: SourceFile
  ) => {
    await hooks
      .callHook("build:post-transform", context, sourceFile)
      .catch((error: Error) => {
        log(
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
    onTransform: handleTransform,
    onPostTransform: handlePostTransform
  });

  await initDotenv(log, context, hooks);
  await initWorkers(log, context, hooks);
  await initEntry(log, context, hooks);

  await hooks.callHook("init:complete", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while finishing initialization for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing initialization for the Storm Stack project",
      { cause: error }
    );
  });
}
