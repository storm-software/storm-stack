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
import { listFiles } from "@stryke/fs/list-files";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import { writeFile } from "../helpers/utilities/write-file";
import type { Context, EngineHooks, Options } from "../types/build";
import type { LogFn } from "../types/config";
import { newApplication } from "./application";
import { newLibrary } from "./library";

export async function _new<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  await hooks.callHook("new:begin", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while starting the new process to add a Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while starting the new process to add a Storm Stack project",
      { cause: error }
    );
  });

  const packagePath = await resolvePackage("@storm-stack/core");
  if (!packagePath) {
    throw new Error(
      "Could not resolve the Storm Stack core package. Please ensure it is installed."
    );
  }

  const files = await listFiles(
    joinPaths(packagePath, "files/common/**/*.hbs")
  );
  for (const file of files) {
    log(LogLevelLabel.TRACE, `Adding template file: ${file}`);

    const template = Handlebars.compile(file);
    await writeFile(
      log,
      joinPaths(context.options.projectRoot, file.replace(".hbs", "")),
      template(context)
    );
  }

  if (context.options.projectType === "application") {
    await newApplication(log, context, hooks);
  } else {
    await newLibrary(log, context, hooks);
  }

  await hooks.callHook("new:complete", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while finishing the new process to add a Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing the new process to add a Storm Stack project",
      { cause: error }
    );
  });
}
