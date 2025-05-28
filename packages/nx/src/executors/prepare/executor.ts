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

import type { ExecutorContext } from "@nx/devkit";
import type { StormWorkspaceConfig } from "@storm-software/config/types";
import { withRunExecutor } from "@storm-software/workspace-tools";
import { Engine } from "@storm-stack/core/engine";
import type { Options } from "@storm-stack/core/types";
import defu from "defu";
import type { StormStackPrepareExecutorSchema } from "./schema";

export async function executorFn(
  options: StormStackPrepareExecutorSchema,
  context: ExecutorContext,
  workspaceConfig: StormWorkspaceConfig
) {
  if (!context.projectName) {
    throw new Error(
      "The executor requires `projectName` on the context object."
    );
  }

  if (
    !context.projectName ||
    !context.projectsConfigurations?.projects ||
    !context.projectsConfigurations.projects[context.projectName] ||
    !context.projectsConfigurations.projects[context.projectName]?.root
  ) {
    throw new Error(
      "The executor requires `projectsConfigurations` on the context object."
    );
  }

  const projectRoot =
    context.projectsConfigurations.projects[context.projectName]!.root;
  const projectType =
    context.projectsConfigurations.projects[context.projectName]!.projectType;

  const engine = new Engine(
    defu(
      {
        projectRoot,
        projectType
      },
      options
    ) as Options,
    workspaceConfig
  );

  await engine.init();
  await engine.prepare(options.autoClean !== false);
  await engine.finalize();

  return {
    success: true
  };
}

export default withRunExecutor<StormStackPrepareExecutorSchema>(
  "Storm Stack - Prepare executor",
  executorFn,
  {
    skipReadingConfig: false,
    hooks: {
      applyDefaultOptions: (options: StormStackPrepareExecutorSchema) => {
        options.entry ??= "{sourceRoot}/index.ts";
        options.mode ??= "production";

        return options;
      }
    }
  }
);
