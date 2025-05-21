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

// eslint-disable-next-line ts/consistent-type-imports
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
