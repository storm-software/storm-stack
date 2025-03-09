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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { StormConfig } from "@storm-software/config/types";
import { Engine } from "./engine";
import { createLog } from "./helpers/utilities/logger";
import type { Options } from "./types/build";

/**
 * Run the Storm Stack **build** process
 *
 * @param options - The options provided to Storm Stack
 * @param workspaceConfig - The configuration of the current workspace
 */
export async function build<TOptions extends Options = Options>(
  options: TOptions,
  workspaceConfig: StormConfig
) {
  const log = createLog("build", options);
  log(LogLevelLabel.INFO, "Running Storm Stack build process...");

  const engine = new Engine(options, workspaceConfig);

  log(LogLevelLabel.TRACE, "Initializing Storm Stack driver...");
  await engine.init();

  log(LogLevelLabel.TRACE, "Prepare Storm Stack project...");
  await engine.prepare();

  log(LogLevelLabel.TRACE, "Building Storm Stack project...");
  await engine.build();

  log(LogLevelLabel.TRACE, "Finalizing Storm Stack build...");
  await engine.finalize();
}

/**
 * Run the Storm Stack **prepare** process
 *
 * @param options - The options provided to Storm Stack
 * @param workspaceConfig - The configuration of the current workspace
 */
export async function prepare<TOptions extends Options = Options>(
  options: TOptions,
  workspaceConfig: StormConfig
) {
  const log = createLog("prepare", options);
  log(LogLevelLabel.TRACE, "Running Storm Stack prepare process...");

  const engine = new Engine(options, workspaceConfig);

  log(LogLevelLabel.TRACE, "Initializing Storm Stack driver...");
  await engine.init();

  log(LogLevelLabel.TRACE, "Preparing Storm Stack project...");
  await engine.prepare();

  log(LogLevelLabel.TRACE, "Finalizing Storm Stack project...");
  await engine.finalize();
}
