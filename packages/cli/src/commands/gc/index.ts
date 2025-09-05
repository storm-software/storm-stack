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

import { Engine } from "@storm-stack/core/base/engine";
import { CleanInlineConfig } from "@storm-stack/core/types";
import { StormRequest } from "storm:request";

/**
 * The request data type for the garbage collection command.
 */
interface GarbageCollectionRequest {
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
 * Perform garbage collection for a Storm Stack project.
 *
 * @title Garbage Collection
 *
 * @param request - The request object containing the parameters for the garbage collection command.
 */
async function handler(request: StormRequest<GarbageCollectionRequest>) {
  const data = request.data;

  $storm.log
    .info`Performing garbage collection on Storm Stack caches and temporary files...`;

  const inlineConfig = {
    root: data.root,
    command: "clean"
  } as CleanInlineConfig;

  const engine = await Engine.create(inlineConfig);

  await engine.clean(inlineConfig);
  await engine.finalize();

  $storm.log.info(`Garbage collection completed successfully.`);
}

export default handler;
