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
import { createDirectory, removeDirectory } from "@stryke/fs/helpers";
import { joinPaths } from "@stryke/path/join-paths";
import { initTypedoc } from "../../../lib/typedoc/init";
import type { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";

/**
 * Generates API-Reference documentation for the Storm Stack project artifacts.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function docsApiReference(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    "Writing API-Reference documentation for the Storm Stack project artifacts."
  );

  // Clean and recreate the output directories
  const outputPath = joinPaths(
    context.options.projectRoot,
    "docs",
    "generated",
    "api-reference"
  );

  if (existsSync(outputPath)) {
    await removeDirectory(outputPath);
  }

  await createDirectory(outputPath);

  const { generateDocs, getReflections } = await initTypedoc(context, {
    outputPath
  });

  const project = await getReflections();
  if (project) {
    await generateDocs({ project });
  }

  await hooks.callHook("docs:api-reference", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while writing the API-Reference documentation for the Storm Stack project artifacts: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while writing the API-Reference documentation for the Storm Stack project artifacts",
      {
        cause: error
      }
    );
  });
}
