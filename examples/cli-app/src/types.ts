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
import { StormSentryLogEnv } from "@storm-stack/log-sentry/types";

/**
 * The payload for the example CLI application.
 */
export interface ServePayload {
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

export interface AddPayload {
  /**
   * The file to add to the file system.
   *
   * @defaultValue "server.ts"
   */
  file: string;

  /**
   * The type of the file.
   *
   * @defaultValue "server"
   */
  type: string;
}

export interface AddPagePayload {
  /**
   * The file to add to the file system.
   *
   * @defaultValue "page.ts"
   */
  file: string;
}

export interface StormNodeAppEnv extends StormSentryLogEnv {}
