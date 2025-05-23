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

import type { MaybePromise } from "@stryke/types/base";
import type { EngineHooks, Options } from "./build";
import type { PluginConfig } from "./config";

export interface IPlugin<TOptions extends Options = Options> {
  /**
   * The name of the plugin
   */
  name: string;

  /**
   * The path to install the plugin
   */
  installPath: string;

  /**
   * Function to add hooks to the engine
   */
  addHooks: (hooks: EngineHooks<TOptions>) => MaybePromise<void>;
}

export interface IPreset<TOptions extends Options = Options>
  extends IPlugin<TOptions> {
  /**
   * A list of plugin modules required as dependencies by the current plugin.
   *
   * @remarks
   * These plugins will be called prior to the current plugin.
   */
  dependencies?: Array<string | PluginConfig>;
}
