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
import { listFiles } from "@stryke/fs/list-files";
import { resolvePackage } from "@stryke/fs/resolve";
import { joinPaths } from "@stryke/path/join-paths";
import * as Handlebars from "handlebars";
import { writeFile } from "../../../lib/utilities/write-file";
import type { EngineHooks } from "../../../types/build";
import type { Context } from "../../../types/context";

/**
 * Adds a new Storm Stack application project.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function newApplication(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Adding a new Storm Stack application project.`
  );

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
    context.log(LogLevelLabel.TRACE, `Adding template file: ${file}`);

    const template = Handlebars.compile(file);
    await writeFile(
      context.log,
      joinPaths(context.options.projectRoot, file.replace(".hbs", "")),
      template(context)
    );
  }

  await hooks.callHook("new:application", context).catch((error: Error) => {
    context.log(
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
