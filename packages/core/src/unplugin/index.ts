/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getWorkspaceConfig } from "@storm-software/config-tools/get-config";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type {
  TransformResult,
  UnpluginBuildContext,
  UnpluginFactory,
  UnpluginInstance
} from "unplugin";
import { createUnplugin } from "unplugin";
import { Engine } from "../base/engine";
import { createLog } from "../lib/logger";
import { getSourceFile } from "../lib/utilities/source-file";
import type { BuildInlineConfig, Context, WorkspaceConfig } from "../types";
import type { UserConfig } from "../types/config";

export type StormStackUnpluginFactory = UnpluginFactory<UserConfig>;

export type StormStackUnpluginInstance = UnpluginInstance<UserConfig>;

export const unpluginFactory: StormStackUnpluginFactory = (
  userConfig: UserConfig
) => {
  const log = createLog("unplugin", userConfig);
  log(LogLevelLabel.TRACE, "Initializing Unplugin");

  try {
    const inlineConfig = {
      ...userConfig,
      command: "build"
    } as BuildInlineConfig;

    let workspaceConfig!: WorkspaceConfig;
    let engine!: Engine;
    let context!: Context;

    async function buildStart(this: UnpluginBuildContext): Promise<void> {
      log(LogLevelLabel.TRACE, "Build Starting");

      workspaceConfig = await getWorkspaceConfig();

      engine = new Engine(inlineConfig, workspaceConfig);

      log(LogLevelLabel.TRACE, "Initializing Storm Stack...");
      context = await engine.init(inlineConfig);

      log(LogLevelLabel.TRACE, "Prepare Storm Stack project...");
      await engine.prepare(inlineConfig);
    }

    async function transform(
      code: string,
      id: string
    ): Promise<TransformResult> {
      log(LogLevelLabel.TRACE, "Running Transform");

      return context.compiler.getResult(
        getSourceFile(id, code),
        await context.compiler.compile(context, id, code)
      );
    }

    async function writeBundle(): Promise<void> {
      log(LogLevelLabel.TRACE, "Finalizing Storm Stack project...");
      await engine.finalize(inlineConfig);
    }

    return {
      name: "storm-stack",
      enforce: "pre",
      transform,
      buildStart,
      writeBundle
    };
  } catch (error) {
    log(LogLevelLabel.ERROR, error);

    throw error;
  }
};

export const StormStack: StormStackUnpluginInstance =
  /* #__PURE__ */ createUnplugin(unpluginFactory);

export default StormStack;
