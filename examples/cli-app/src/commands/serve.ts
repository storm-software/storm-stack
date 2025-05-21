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
import { ServePayload } from "../types";

/**
 * Start a server and serve the application
 *
 * @param event - The event object containing the payload
 */
function handler(event: StormPayload<ServePayload>) {
  const payload = event.data;

  $storm.log.info(
    `Starting server on ${payload.host}:${payload.port} with compress: ${payload.compress} and loadEnv: ${payload.loadEnv}`
  );
}

export default handler;
