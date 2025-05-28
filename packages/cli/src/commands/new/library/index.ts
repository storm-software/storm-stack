/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { Options } from "@storm-stack/core/types/build";
import { createEngine } from "../../../helpers/create-engine";

/**
 * The payload for the example CLI application.
 */
type NewLibraryPayload = Pick<Options, "name" | "projectRoot" | "packageName">;

/**
 * Create a new Storm Stack library in the current workspace.
 *
 * @param payload - The payload object containing the details for the new library.
 */
async function handler(payload: StormPayload<NewLibraryPayload>) {
  const data = payload.data;

  const engine = await createEngine({
    projectRoot: data.projectRoot,
    projectType: "library"
  });
  engine.setIntent("new");

  await engine.new();
  await engine.finalize();
}

export default handler;
