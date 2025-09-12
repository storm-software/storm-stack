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

export interface StormMeta {
  /**
   * The name of the Storm application.
   */
  readonly name: string;

  /**
   * The version of the Storm application.
   */
  readonly version: string;

  /**
   * The default locale for the application.
   */
  readonly defaultLocale: string;

  /**
   * The default timezone for the application.
   */
  readonly defaultTimezone: string;

  /**
   * The current runtime mode to determine the behavior of the application in different environments.
   *
   * @remarks
   * The `mode` is typically set based on the deployment environment and can affect configuration, logging, and feature flags. Valid values for the `mode` are:
   * - `"development"`: Used for local development and testing.
   * - `"staging"`: Used for staging environments that closely mirror production.
   * - `"production"`: Used for live production environments.
   */
  readonly mode: "development" | "staging" | "production";

  /**
   * A boolean indicator specifying if running in production mode.
   */
  readonly isProduction: boolean;

  /**
   * A boolean indicator specifying if running in staging mode.
   */
  readonly isStaging: boolean;

  /**
   * A boolean indicator specifying if running in development mode.
   */
  readonly isDevelopment: boolean;

  /**
   * A boolean indicator specifying if running in debug mode (typically development with debug enabled).
   */
  readonly isDebug: boolean;

  /**
   * A boolean indicator specifying if running in test mode or under test conditions.
   */
  readonly isTest: boolean;
}
