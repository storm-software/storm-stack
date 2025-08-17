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

import { BuildInlineConfig } from "@storm-stack/core/types/config";
import { StormPayload } from "storm:payload";
import { createEngine } from "../../helpers/create-engine";

/**
 * The payload data type for the build command.
 */
interface BuildPayload {
  /**
   * The root directory of the Storm Stack project.
   *
   * @title Project Root
   *
   * @alias project
   * @alias projectRoot
   *
   * @ignore
   */
  root: string;
}

/**
 * Build a Storm Stack project and assemble the distribution files.
 *
 * @param payload - The payload object containing the parameters for the build command.
 */
async function handler(payload: StormPayload<BuildPayload>) {
  const data = payload.data;

  $storm.log.info`Building Storm Stack project at ${data.root}...`;

  const inlineConfig = {
    root: data.root,
    command: "build"
  } as BuildInlineConfig;

  const engine = await createEngine(inlineConfig);

  await engine.build(inlineConfig);
  await engine.finalize(inlineConfig);

  $storm.log.info(
    `Build completed successfully. Distribution files are located in ${data.root}/dist.`
  );
}

export default handler;
