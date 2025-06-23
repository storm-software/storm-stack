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
import { listFiles } from "@stryke/fs/list-files";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import * as Handlebars from "handlebars";
import { writeFile } from "../../helpers/utilities/write-file";
import type { Context, EngineHooks } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function newApplication(
  log: LogFn,
  context: Context,
  hooks: EngineHooks
) {
  log(LogLevelLabel.TRACE, `Adding a new Storm Stack application project.`);

  const packagePath = await resolvePackage("@storm-stack/core");
  if (!packagePath) {
    throw new Error(
      "Could not resolve the Storm Stack core package. Please ensure it is installed."
    );
  }

  const files = await listFiles(
    joinPaths(packagePath, "files/application/**/*.hbs")
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

  await hooks.callHook("new:application", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while creating a new Storm Stack application project: ${error.message} \n${error.stack ?? ""}`
    );
    throw new Error(
      "An error occured while creating a new Storm Stack application project",
      {
        cause: error
      }
    );
  });
}
