/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import type { TypeDefinitionParameter } from "@stryke/types/index";

export enum StormStackNodeFeatures {
  SENTRY = "sentry",
  ENV_PATHS = "env-paths"
}

export interface StormStackNodePluginConfig {
  /**
   * The features to include in the application
   *
   * @defaultValue []
   */
  features: StormStackNodeFeatures[];

  /**
   * Should this plugin skip the build process for both applications and libraries
   *
   * @defaultValue false
   */
  skipBuild: boolean;

  /**
   * The runtime configuration for the application
   *
   * @defaultValue "./service.config.ts"
   */
  config?: TypeDefinitionParameter;
}
