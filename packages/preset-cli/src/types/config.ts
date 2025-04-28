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

import type { StormStackNodeFeatures } from "@storm-stack/plugin-node/types/config";

export interface StormStackCLIPresetConfig {
  /**
   * The features to include in the application
   *
   * @defaultValue []
   */
  features: StormStackNodeFeatures[];

  /**
   * The name of the binary that will be generated to run the CLI
   */
  bin?: string;
}
