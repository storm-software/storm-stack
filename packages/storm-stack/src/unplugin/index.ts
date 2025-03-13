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

import { getWorkspaceConfig } from "@storm-software/config-tools/get-config";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { StormConfig } from "@storm-software/config/types";
import type {
  TransformResult,
  UnpluginBuildContext,
  UnpluginFactory,
  UnpluginInstance
} from "unplugin";
import { createUnplugin } from "unplugin";
import { Engine } from "../engine";
import { createLog } from "../helpers/utilities/logger";
import type { Options } from "../types";

export const unpluginFactory: UnpluginFactory<Options> = options => {
  const log = createLog("unplugin", options);
  log(LogLevelLabel.TRACE, "Initializing Unplugin");

  try {
    let workspaceConfig!: StormConfig;
    let engine!: Engine;

    async function buildStart(this: UnpluginBuildContext): Promise<void> {
      log(LogLevelLabel.TRACE, "Build Starting");

      workspaceConfig = await getWorkspaceConfig();
      engine = new Engine(options, workspaceConfig);

      log(LogLevelLabel.TRACE, "Initializing Storm Stack...");
      await engine.init();

      log(LogLevelLabel.TRACE, "Prepare Storm Stack project...");
      await engine.prepare(true);
    }

    async function transform(
      code: string,
      id: string
    ): Promise<TransformResult> {
      log(LogLevelLabel.TRACE, "Running Transform");

      return engine.compiler.getResult(
        engine.compiler.getSourceFile(id, code),
        await engine.compiler.compile(id, code)
      );
    }

    async function writeBundle(): Promise<void> {
      log(LogLevelLabel.TRACE, "Finalizing Storm Stack project...");
      await engine.finalize();
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

export const StormStack: UnpluginInstance<Options> =
  /* #__PURE__ */ createUnplugin<Options>(unpluginFactory);

export default StormStack;
