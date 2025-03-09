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
import type { StormConfig } from "@storm-software/config/types";
import { withRunExecutor } from "@storm-software/workspace-tools";
import defu from "defu";
import { build } from "storm-stack/api";
import { loadConfig } from "storm-stack/helpers";
import type { Options } from "storm-stack/types";
import type { StormStackNodeLibBuildExecutorSchema } from "./schema";

export async function stormStackNodeLibBuildExecutorFn(
  options: StormStackNodeLibBuildExecutorSchema,
  context: ExecutorContext,
  workspaceConfig: StormConfig
) {
  if (!context.projectName) {
    throw new Error("The executor requires a projectName.");
  }

  if (
    !context.projectName ||
    !context.projectsConfigurations?.projects ||
    !context.projectsConfigurations.projects[context.projectName] ||
    !context.projectsConfigurations.projects[context.projectName]?.root
  ) {
    throw new Error("The executor requires projectsConfigurations.");
  }

  const config = await loadConfig(
    context.projectsConfigurations.projects[context.projectName]!.root
  );
  const plugins = config.plugins ?? ["@storm-stack/plugin-node"];

  await build(
    defu(
      {
        plugins,
        projectRoot:
          context.projectsConfigurations.projects[context.projectName]!.root,
        projectType: "library"
      },
      options,
      config
    ) as Options,
    workspaceConfig
  );

  return {
    success: true
  };
}

export default withRunExecutor<StormStackNodeLibBuildExecutorSchema>(
  "Storm Stack NodeJs library build executor",
  stormStackNodeLibBuildExecutorFn,
  {
    skipReadingConfig: false,
    hooks: {
      applyDefaultOptions: (
        options: Partial<StormStackNodeLibBuildExecutorSchema>
      ) => {
        return options;
      }
    }
  }
);
