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
import { StormPayload } from "../../../.storm/runtime/payload";
import { createEngine } from "../../helpers/create-engine";

/**
 * The payload type for the prepare command.
 */
type PreparePayload = Pick<Options, "projectRoot">;

/**
 * Prepare the build artifacts for the Storm Stack project.
 *
 * @remarks
 * This command prepares the Storm Stack project by creating the necessary directories and writing the artifacts files to the project so that it can be built later.
 *
 * @param payload - The payload object containing the parameters for the prepare command.
 */
async function handler(payload: StormPayload<PreparePayload>) {
  const data = payload.data;

  const engine = await createEngine({
    projectRoot: data.projectRoot
  });
  engine.setIntent("prepare");

  await engine.prepare();
  await engine.finalize();
}

export default handler;
