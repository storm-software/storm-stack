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
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import { writeFile } from "../../lib/utilities/write-file";
import type { EngineHooks } from "../../types/build";
import type { Context } from "../../types/context";
import { newApplication } from "./application";
import { newLibrary } from "./library";

/**
 * Creates a new Storm Stack project.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function _new<TContext extends Context = Context>(
  context: TContext,
  hooks: EngineHooks<TContext>
) {
  await hooks.callHook("new:begin", context).catch((error: Error) => {
    context.log(
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
    context.log(LogLevelLabel.TRACE, `Adding template file: ${file}`);

    const template = Handlebars.compile(file);
    await writeFile(
      context.log,
      joinPaths(context.options.projectRoot, file.replace(".hbs", "")),
      template(context)
    );
  }

  if (context.options.projectType === "application") {
    await newApplication(context, hooks);
  } else {
    await newLibrary(context, hooks);
  }

  await hooks.callHook("new:complete", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while finishing the new process to add a Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while finishing the new process to add a Storm Stack project",
      { cause: error }
    );
  });
}
