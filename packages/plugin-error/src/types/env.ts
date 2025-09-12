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

import { StormEnvInterface } from "@storm-stack/core/runtime-types/shared/env";

/**
 * Configuration options for the Storm Error plugin.
 */
export interface StormErrorEnv extends StormEnvInterface {
  /**
   * Indicates if error stack traces should be captured.
   */
  STACKTRACE: boolean;

  /**
   * Indicates if error data should be included.
   */
  INCLUDE_ERROR_DATA: boolean;

  /**
   * A web page to lookup error messages and display additional information given an error code.
   *
   * @remarks
   * This variable is used to provide a URL to a page that can be used to look up error messages given an error code. This is used to provide a more user-friendly error message to the user.
   *
   * @title Error Details URL
   */
  ERROR_URL: string;
}
