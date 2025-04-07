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

import { createLog } from "./helpers/utilities/logger";
import { Plugin } from "./plugin";
import type { Options } from "./types/build";
import type { PluginConfig } from "./types/config";
import type { IPreset } from "./types/plugin";

/**
 * The base class for all Preset
 */
export abstract class Preset<TOptions extends Options = Options>
  extends Plugin<TOptions>
  implements IPreset<TOptions>
{
  /**
   * A list of plugin modules required as dependencies by the current Preset.
   *
   * @remarks
   * These plugins will be called prior to the current Preset.
   */
  public dependencies = [] as Array<string | PluginConfig>;

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
