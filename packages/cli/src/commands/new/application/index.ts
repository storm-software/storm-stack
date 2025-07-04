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

import { NewInlineConfig } from "@storm-stack/core/types/config";
import { StormPayload } from "../../../../.storm/runtime/payload";
import { createEngine } from "../../../helpers/create-engine";

/**
 * The payload for the example CLI application.
 */
interface NewApplicationPayload {
  name: string;
  root: string;
  packageName: string;
}

/**
 * Create a new Storm Stack application in the current workspace.
 *
 * @param payload - The payload object containing the details for the new application.
 */
async function handler(payload: StormPayload<NewApplicationPayload>) {
  const data = payload.data;

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
