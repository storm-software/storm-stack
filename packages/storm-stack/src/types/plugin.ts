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

import type { MaybePromise } from "@stryke/types/base";
import type { EngineHooks, InferResolvedOptions, Options } from "./build";
import type { PluginConfig } from "./config";

export interface IPlugin<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> {
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
  addHooks: (
    hooks: EngineHooks<TOptions, TResolvedOptions>
  ) => MaybePromise<void>;

  /**
   * A list of plugin modules required as dependencies by the current plugin.
   *
   * @remarks
   * These plugins will be called prior to the current plugin.
   */
  dependencies?: Array<string | PluginConfig>;
}
