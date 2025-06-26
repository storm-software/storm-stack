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

import type { MaybePromise } from "@stryke/types/base";
import type { Context, EngineHooks } from "./build";
import type { PluginConfig } from "./config";

export type RendererFunction = (
  context: Context,
  ...params: any[]
) => MaybePromise<void>;

/**
 * A object used to render the output artifacts of the Storm Stack processes.
 *
 * @remarks
 * A utility class used by plugins to render generated output files during various Storm Stack processes. Some possible items rendered include (but are not limited to): source code, documentation, DevOps configuration, and deployment infrastructure/IOC.
 */
export interface IRenderer {
  /**
   * The name of the renderer
   */
  name: string;
}

export interface IPlugin {
  /**
   * The name of the plugin
   */
  name: string;

  /**
   * The path to install the plugin
   */
  installPath: string;

  /**
   * A list of plugin modules required as dependencies by the current plugin.
   *
   * @remarks
   * These plugins will be called prior to the current plugin.
   */
  dependencies?: Array<string | PluginConfig>;

  /**
   * Function to add hooks to the engine
   */
  innerAddHooks: (hooks: EngineHooks) => MaybePromise<void>;
}
