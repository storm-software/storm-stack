/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import type { ExecutorContext } from "@nx/devkit";
import { writeTrace } from "@storm-software/config-tools/logger";
import type { StormWorkspaceConfig } from "@storm-software/config/types";
import { withRunExecutor } from "@storm-software/workspace-tools";
import { Engine } from "@storm-stack/core/engine";
import { loadConfig } from "@storm-stack/core/helpers/load-config";
import type { Options } from "@storm-stack/core/types";
import defu from "defu";
import type { StormStackBuildExecutorSchema } from "./schema";

export async function executorFn(
  options: StormStackBuildExecutorSchema,
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

  const config = await loadConfig(
    context.projectsConfigurations.projects[context.projectName]!.root,
    options.mode
  );

  const engine = new Engine(
    defu(
      {
        projectRoot:
          context.projectsConfigurations.projects[context.projectName]!.root
      },
      options,
      config
    ) as Options,
    workspaceConfig
  );

  writeTrace("Initializing Storm Stack engine");
  await engine.init();

  writeTrace("Building Storm Stack project");
  await engine.build(
    options.autoPrepare !== false,
    options.autoClean !== false
  );

  writeTrace("Finalizing Storm Stack processes");
  await engine.finalize();

  writeTrace("Storm Stack - Build completed");

  return {
    success: true
  };
}

export default withRunExecutor<StormStackBuildExecutorSchema>(
  "Storm Stack - Build executor",
  executorFn,
  {
    skipReadingConfig: false,
    hooks: {
      applyDefaultOptions: (options: StormStackBuildExecutorSchema) => {
        options.entry ??= "{sourceRoot}/index.ts";
        options.mode ??= "production";

        return options;
      }
    }
  }
);
