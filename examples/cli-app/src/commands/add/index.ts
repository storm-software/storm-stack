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

import { StormPayload } from "storm:payload";
import { AddPayload } from "../../types";

/**
 * Add an item to the file system
 *
 * @param payload - The event object containing the payload
 */
function handler(payload: StormPayload<AddPayload>) {
  const data = payload.data;

  $storm.log.info(`Adding ${data.type} to file system on ${data.file}`);
}

export default handler;
