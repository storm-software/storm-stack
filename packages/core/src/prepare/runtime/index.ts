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
import { writeFile } from "../../helpers/utilities/write-file";
import type { Context, EngineHooks, Options } from "../../types/build";
import type { LogFn } from "../../types/config";
import { writeApp } from "./runtime/node/app";
import { writeContext } from "./runtime/node/context";
import { writeEvent } from "./runtime/node/event";
import { writeError } from "./runtime/shared/error";
import { writeId } from "./runtime/shared/id";
import { writeInit } from "./runtime/shared/init";
import { writeLog } from "./runtime/shared/log";
import { writeRequest } from "./runtime/shared/request";
import { writeResponse } from "./runtime/shared/response";
import { writeStorage } from "./runtime/shared/storage";

export async function prepareRuntime<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Preparing the runtime artifacts for the Storm Stack project.`
  );

  const runtimeDir = joinPaths(
    context.options.projectRoot,
    context.artifactsDir,
    "runtime"
  );

  const promises = [
    writeFile(log, joinPaths(runtimeDir, "request.ts"), writeRequest()),
    writeFile(log, joinPaths(runtimeDir, "response.ts"), writeResponse()),
    writeFile(log, joinPaths(runtimeDir, "error.ts"), writeError()),
    writeFile(log, joinPaths(runtimeDir, "id.ts"), writeId()),
    writeFile(log, joinPaths(runtimeDir, "log.ts"), writeLog(context), true),
    writeFile(log, joinPaths(runtimeDir, "storage.ts"), writeStorage(context)),
    writeFile(log, joinPaths(runtimeDir, "init.ts"), writeInit(context))
  ];
  if (context.options.platform === "node") {
    promises.push(
      writeFile(log, joinPaths(runtimeDir, "app.ts"), writeApp(context))
    );
    promises.push(
      writeFile(log, joinPaths(runtimeDir, "context.ts"), writeContext(context))
    );
    promises.push(
      writeFile(log, joinPaths(runtimeDir, "event.ts"), writeEvent(context))
    );
  }

  await Promise.all(promises);

  await hooks.callHook("prepare:runtime", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while preparing the runtime artifacts for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while preparing the runtime artifacts for the Storm Stack project",
      { cause: error }
    );
  });
}
