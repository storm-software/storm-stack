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

import { AddPayload } from "../../types";

/**
 * Add an item to the file system
 *
 * @param event - The event object containing the payload
 */
function handler(event: StormPayload<AddPayload>) {
  const payload = event.data;

  $storm.log.info(`Adding ${payload.type} to file system on ${payload.file}`);
}

export default handler;
