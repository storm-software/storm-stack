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

// import { prompt } from "storm:cli";

/**
 * The payload for the example CLI application.
 */
interface NewApplicationPayload {
  /**
   * The host to bind the server to.
   *
   * @defaultValue "localhost"
   */
  host: string;

  /**
   * The port to bind the server to.
   *
   * @defaultValue 3000
   */
  port: number;

  /**
   * Should the server serve compressed files?
   */
  compress?: boolean;

  /**
   * Should the server serve compressed files?
   *
   * @defaultValue "node"
   */
  platform: "node" | "browser";

  /**
   * Should the server load environment variables from the .env file?
   *
   * @defaultValue true
   */
  loadEnv: boolean;
}

/**
 * New a Storm Stack application project to the current workspace.
 *
 * @param payload - The request object containing the command payload
 */
async function handler(payload: StormPayload<NewApplicationPayload>) {
  const data = payload.data;

  // await prompt(payload.host);

  $storm.log.info(
    `Starting server on ${data.host}:${data.port} with compress: ${data.compress} and loadEnv: ${data.loadEnv}`
  );
}

export default handler;
