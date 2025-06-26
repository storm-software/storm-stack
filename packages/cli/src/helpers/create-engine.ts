/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getWorkspaceConfig } from "@storm-software/config-tools/get-config";
import { Engine } from "@storm-stack/core/engine";
import { InlineConfig } from "@storm-stack/core/types/config";

/**
 * Creates a new instance of the Engine with the provided inline configuration and workspace configuration.
 *
 * @param inlineConfig - The inline config to initialize the Engine.
 * @returns A promise that resolves to the initialized Engine instance.
 */
export async function createEngine(
  inlineConfig: InlineConfig
): Promise<Engine> {
  const workspaceConfig = await getWorkspaceConfig();

  const engine = new Engine(inlineConfig, workspaceConfig);
  await engine.init(inlineConfig);

  return engine;
}
