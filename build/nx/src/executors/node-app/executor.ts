/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import type { ExecutorContext, PromiseExecutor } from "@nx/devkit";
import { withRunExecutor } from "@storm-software/workspace-tools";
import { build } from "@storm-stack/build-core/node/app";
import type { NodeApplicationExecutorSchema } from "./schema";

export async function executorFn(
  options: NodeApplicationExecutorSchema,
  context: ExecutorContext
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

  await build(
    context.projectsConfigurations.projects[context.projectName]?.root!
  );

  return {
    success: true
  };
}

export default withRunExecutor<NodeApplicationExecutorSchema>(
  "NodeJs application build executor",
  executorFn,
  {
    skipReadingConfig: false,
    hooks: {
      applyDefaultOptions: (options: NodeApplicationExecutorSchema) => {
        return options as NodeApplicationExecutorSchema;
      }
    }
  }
) as PromiseExecutor<NodeApplicationExecutorSchema>;
