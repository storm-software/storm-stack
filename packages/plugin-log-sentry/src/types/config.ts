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

import { StormConfigInterface } from "@storm-stack/core/runtime-types/shared/config";

/**
 * Configuration options for the Sentry logging plugin.
 */
export interface StormSentryLogConfig extends StormConfigInterface {
  /**
   * The DSN for Sentry
   *
   * @remarks
   * This is used to send logs to Sentry.
   */
  SENTRY_DSN: string;
}
