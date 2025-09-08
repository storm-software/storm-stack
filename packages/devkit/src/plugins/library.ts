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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";
import { unbuild } from "@storm-stack/core/lib/unbuild";
import { EngineHooks } from "@storm-stack/core/types/build";
import { Context } from "@storm-stack/core/types/context";
import {
  PluginBaseOptions,
  PluginOptions
} from "@storm-stack/core/types/plugin";

/**
 * Plugin for building Storm Stack library packages.
 *
 * @remarks
 * This plugin provides the functionality to build Storm Stack library packages using Unbuild. It extends the {@link Plugin} class and adds hooks for the build process.
 */
export default class LibraryPlugin<
  TContext extends Context = Context,
  TOptions extends PluginBaseOptions = PluginBaseOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "build:library": this.#build.bind(this)
    });
  }

  /**
   * Builds the Storm Stack library package.
   *
   * @param context - The build context.
   * @returns A promise that resolves when the build is complete.
   */
  async #build(context: TContext) {
    this.log(LogLevelLabel.TRACE, `Build the Storm Stack library package.`);

    return unbuild(context);
  }
}
