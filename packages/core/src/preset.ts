/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { createLog } from "./helpers/utilities/logger";
import { Plugin } from "./plugin";
import type { Options } from "./types/build";
import type { IPreset } from "./types/plugin";

/**
 * The base class for all Preset
 */
export abstract class Preset<TOptions extends Options = Options>
  extends Plugin<TOptions>
  implements IPreset<TOptions>
{
  /**
   * The constructor for the Preset
   *
   * @param name - The name of the preset
   * @param installPath - The path to install the preset
   */
  public constructor(name: string, installPath?: string) {
    super(name, installPath);

    this.log = createLog(`${this.name}-preset`);
    this.installPath = installPath || `@storm-stack/preset-${this.name}`;
  }
}
