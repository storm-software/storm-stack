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
import { DocsInlineConfig } from "@storm-stack/core/types/config";
import {
  StormStackExecutorContext,
  withStormStackExecutor
} from "../../base/base-executor";
import type { StormStackDocsExecutorSchema } from "./schema";

export async function executorFn(
  context: StormStackExecutorContext<"docs", StormStackDocsExecutorSchema>,
  engine: Engine
): Promise<BaseExecutorResult> {
  await engine.docs(context.inlineConfig as DocsInlineConfig);

  return {
    success: true
  };
}

const executor: PromiseExecutor<StormStackDocsExecutorSchema> =
  withStormStackExecutor<"docs", StormStackDocsExecutorSchema>(
    "docs",
    executorFn
  );

export default executor;
