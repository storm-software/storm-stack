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
import type { StormConfig } from "@storm-software/config/types";
import defu from "defu";
import { Engine } from "storm-stack/engine";
import { loadConfig } from "storm-stack/helpers/load-config";
import type { Options, PluginConfig } from "storm-stack/types";
import type { StormStackBuildExecutorSchema } from "./build-executor.schema";

export function createBuildExecutor(plugins: Array<string | PluginConfig>) {
  return async <TOptions extends StormStackBuildExecutorSchema>(
    options: TOptions,
    context: ExecutorContext,
    workspaceConfig: StormConfig
  ) => {
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
          plugins: config.plugins ?? plugins,
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

    writeTrace("Preparing Storm Stack project");
    await engine.prepare();

    writeTrace("Building Storm Stack project");
    await engine.build();

    writeTrace("Finalizing Storm Stack build");
    await engine.finalize();

    writeTrace("Storm Stack build completed");

    return {
      success: true
    };
  };
}
