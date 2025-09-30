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

import type { MaybePromise } from "@stryke/types/base";
import { Range } from "semver";
import type { EngineHooks } from "./build";
import type { LogFn, PluginConfig } from "./config";
import { Context } from "./context";

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
export interface RendererInterface {
  /**
   * The name of the renderer
   */
  name: string;

  /**
   * A list of [npm](https://www.npmjs.com/) dependency packages that are required for the rendered output to work.
   *
   * @remarks
   * These dependencies will be installed and added to the project's `package.json` file when the Storm Stack initialization process is run.
   */
  getPackageDeps: () => PluginPackageDependencies;
}

export type PluginPackageDependencyMeta =
  | "dependency"
  | "devDependency"
  | { version?: string | Range; type?: "dependency" | "devDependency" };

export type PluginPackageDependencies = Record<
  string,
  PluginPackageDependencyMeta
>;

export interface PluginBaseOptions {
  /**
   * A list of packages that are required by the generated output of the plugin.
   */
  packageDeps?: PluginPackageDependencies;
}

export type PluginOptions<
  TOptions extends PluginBaseOptions = PluginBaseOptions
> = TOptions & {
  /**
   * A function used to log messages during the plugin's execution.
   *
   * @remarks
   * This option is provided by the {@link Engine} during the plugin's initialization.
   */
  log?: LogFn;
};

// eslint-disable-next-line ts/naming-convention
export const __STORM_STACK_PLUGIN_BRAND__ = "__storm_stack_plugin_brand__";

/**
 * A configuration object used to define a Storm Stack plugin.
 *
 * @remarks
 * This is used to define a plugin that can be loaded by the {@link Engine}.
 */
export interface PluginInterface<
  TContext extends Context = Context,
  TOptions extends PluginBaseOptions = PluginBaseOptions
> {
  /**
   * A property to identify the object as a Storm Stack Plugin.
   */
  [__STORM_STACK_PLUGIN_BRAND__]: true;

  /**
   * The name of the plugin
   */
  name: string;

  /**
   * The identifier for the plugin used in the {@link isSame} method
   *
   * @remarks
   * Child plugins can override this to provide a more or less specific identifier.
   */
  identifier: string;

  /**
   * A list of primary keys for the plugin's options.
   *
   * @remarks
   * This is used to identify when two instances of the plugin are the same and can be de-duplicated.
   */
  primaryKeys: any[];

  /**
   * Returns true if the plugin is a singleton. Singleton plugins can only be instantiated once (so whenever other plugins specify them as dependencies, they will be de-duplicated).
   *
   * @remarks
   * A plugin is considered a singleton if it has zero primary key option fields defined.
   */
  isSingleton: boolean;

  /**
   * The configuration options for the plugin
   *
   * @remarks
   * This is used to store the configuration options for the plugin, which can be accessed by the plugin's methods.
   */
  options: PluginOptions<TOptions>;

  /**
   * A list of plugin modules required as dependencies by the current plugin.
   *
   * @remarks
   * These plugins will be called prior to the current plugin.
   */
  dependencies?: Array<string | PluginConfig>;

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  addHooks: (hooks: EngineHooks<TContext>) => void;

  /**
   * Checks if the current plugin is the same as another plugin.
   *
   * @remarks
   * This is used to identify when two instances of the plugin are the same and can be de-duplicated.
   *
   * @param plugin - The other plugin to compare against.
   * @returns `true` if the two plugins are the same, `false` otherwise.
   */
  isSame: (plugin: PluginInterface<TContext, TOptions>) => boolean;
}
