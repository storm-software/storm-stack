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

import { StormSentryLogEnv } from "@storm-stack/plugin-log-sentry/types/env";

/**
 * Configuration options for the Storm Stack CLI.
 */
export interface StormStackCLIEnv extends StormSentryLogEnv {
  /**
   * The mode used for outputting results.
   * - `memory`: Generated source code is stored in a virtual file system to reduce boilerplate.
   * - `fs`: Outputs generated results to the local file system.
   *
   * @defaultValue "memory"
   */
  OUTPUT_MODE?: "memory" | "fs";

  /**
   * An indicator used to skip version checks for installed packages.
   */
  readonly STORM_STACK_SKIP_VERSION_CHECK?: boolean;
}
