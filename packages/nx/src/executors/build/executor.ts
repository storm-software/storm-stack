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

import { PromiseExecutor } from "@nx/devkit";
import { BaseExecutorResult } from "@storm-software/workspace-tools/types";
import { Engine } from "@storm-stack/core/base/engine";
import { BuildInlineConfig } from "@storm-stack/core/types";
import defu from "defu";
import {
  StormStackExecutorContext,
  withStormStackExecutor
} from "../../base/base-executor";
import type { StormStackBuildExecutorSchema } from "./schema";

export async function executorFn(
  context: StormStackExecutorContext<"build", StormStackBuildExecutorSchema>,
  engine: Engine
): Promise<BaseExecutorResult> {
  await engine.build(
    defu(
      {
        entry: context.options.entry,
        clean: context.options.clean,
        skipCache: context.options.skipCache,
        skipLint: context.options.skipLint,
        mode: context.options.mode
      },
      context.inlineConfig
    ) as BuildInlineConfig
  );

  return {
    success: true
  };
}

const executor: PromiseExecutor<StormStackBuildExecutorSchema> =
  withStormStackExecutor<"build", StormStackBuildExecutorSchema>(
    "build",
    executorFn
  );

export default executor;
