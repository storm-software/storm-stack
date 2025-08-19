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

import { NewInlineConfig } from "@storm-stack/core/types/config";
import { StormRequest } from "storm:request";
import { createEngine } from "../../../helpers/create-engine";

/**
 * The request for the example CLI application.
 */
interface NewApplicationRequest {
  /**
   * The name of the library.
   *
   * @ignore
   */
  name: string;

  /**
   * The root directory of the Storm Stack project.
   *
   * @ignore
   */
  root: string;

  /**
   * The name of the library.
   *
   * @ignore
   */
  packageName: string;
}

/**
 * Create a new Storm Stack application in the current workspace.
 *
 * @param request - The request object containing the details for the new application.
 */
async function handler(request: StormRequest<NewApplicationRequest>) {
  const data = request.data;

  const inlineConfig = {
    root: data.root,
    name: data.name,
    packageName: data.packageName,
    type: "application",
    command: "new"
  } as NewInlineConfig;

  const engine = await createEngine(inlineConfig);

  await engine.new(inlineConfig);
  await engine.finalize(inlineConfig);
}

export default handler;
