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

import { StormStorageInterface } from "../shared";
import { StormConfigInterface } from "../shared/config";
import { StormLogInterface } from "../shared/log";
import { StormEnv } from "./env";

/**
 * The global Storm Stack application context. This object contains information related to the current process's execution.
 *
 * @remarks
 * The Storm Stack application context object is injected into the global scope of the application. It can be accessed using `$storm` or `useStorm()` in the application code.
 */
export interface StormContext {
  /**
   * The context metadata.
   */
  meta: Record<string, any>;

  /**
   * Environment/runtime specific application data.
   */
  env: StormEnv;

  /**
   * The root application logger for the Storm Stack application.
   */
  log: StormLogInterface;

  /**
   * The {@link StormStorageInterface} instance used by the Storm Stack application.
   */
  storage: StormStorageInterface;

  /**
   * The configuration parameters for the Storm application.
   */
  config: StormConfigInterface;

  [key: string]: any;
}
