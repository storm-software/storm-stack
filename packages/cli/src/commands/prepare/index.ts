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

import { PrepareInlineConfig } from "@storm-stack/core/types/config";
import { StormError } from "storm:error";
import { StormRequest } from "storm:request";
import { createEngine } from "../../helpers/create-engine";

/**
 * The request data type for the prepare command.
 */
interface PrepareRequest {
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
 * Prepare the build artifacts for the Storm Stack project.
 *
 * @remarks
 * This command prepares the Storm Stack project by creating the necessary directories and writing the artifacts files to the project so that it can be built later.
 *
 * @param request - The request object containing the parameters for the prepare command.
 */
async function handler(request: StormRequest<PrepareRequest>) {
  const data = request.data;
  if (!data.root) {
    throw new StormError({ code: 1 });
  }

  const inlineConfig = {
    root: data.root,
    command: "prepare"
  } as PrepareInlineConfig;

  const engine = await createEngine(inlineConfig);

  await engine.prepare(inlineConfig);
  await engine.finalize(inlineConfig);
}

export default handler;
