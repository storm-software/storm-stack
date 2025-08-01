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
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { createLog, extendLog } from "../lib/logger";
import type { EngineHooks } from "../types/build";
import type { LogFn, PluginConfig } from "../types/config";
import { Context } from "../types/context";
import type {
  PluginBaseConfig,
  PluginInterface,
  PluginOptions
} from "../types/plugin";

/**
 * The base class for all plugins
 */
export abstract class Plugin<
  TConfig extends PluginBaseConfig = PluginBaseConfig
> implements PluginInterface<TConfig>
{
  #log?: LogFn;

  /**
   * A list of plugin modules required as dependencies by the current Plugin.
   *
   * @remarks
   * These plugins will be called prior to the current Plugin.
   */
  public dependencies = [] as Array<string | PluginConfig>;

  /**
   * The configuration options for the plugin
   *
   * @remarks
   * This is used to store the configuration options for the plugin, which can be accessed by the plugin's methods.
   */
  public options: PluginOptions<TConfig>;

  /**
   * A list of dependencies that are required for the plugin to work. These dependencies will be installed when Storm Stack CLI is run.
   */
  protected packageDeps: Record<string, "dependency" | "devDependency"> = {};

  /**
   * The name of the plugin
   *
   * @remarks
   * This is used to identify the plugin in logs and other output.
   */
  public get name(): string {
    const name = kebabCase(this.constructor.name);
    if (name.startsWith("plugin-")) {
      return name.replace(/^plugin-/, "").trim();
    } else if (name.endsWith("-plugin")) {
      return name.replace(/-plugin$/, "").trim();
    }

    return name;
  }

  /**
   * The identifier for the plugin used in the {@link isSame} method
   *
   * @remarks
   * Child plugins can override this to provide a more or less specific identifier.
   */
  public get identifier(): string {
    return this.name;
  }

  /**
   * The primary keys for the plugin's options.
   *
   * @remarks
   * This is used to identify when a two instances of the plugin are the same and can be de-duplicated.
   */
  public get primaryKeys(): any[] {
    return this.primaryKeyFields.map(
      primaryKeyField => (this.options as any)[primaryKeyField]
    );
  }

  /**
   * Returns true if the plugin is a singleton. Singleton plugins can only be instantiated once (so whenever other plugins specify them as dependencies, they will be de-duplicated).
   *
   * @remarks
   * A plugin is considered a singleton if it has zero primary key option fields defined.
   */
  public get isSingleton(): boolean {
    return this.primaryKeyFields.length === 0;
  }

  /**
   * A list of primary keys for the plugin's options.
   *
   * @remarks
   * This is used to identify when a two instances of the plugin are the same and can be de-duplicated.
   */
  protected get primaryKeyFields(): string[] {
    return [];
  }

  /**
   * The logger function to use
   */
  protected get log(): LogFn {
    if (!this.#log) {
      this.#log = this.options.log
        ? extendLog(this.options.log, `${titleCase(this.name)} Plugin`)
        : createLog(`${titleCase(this.name)} Plugin`);
    }

    return this.#log;
  }

  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TConfig>) {
    this.options = options;
  }

  /**
   * Checks if the current plugin is the same as another plugin based on primary key fields.
   *
   * @param plugin - The plugin to compare with.
   * @returns `true` if the plugins are the same, `false` otherwise.
   */
  public isSame(plugin: PluginInterface): boolean {
    return (
      this.identifier === plugin.identifier &&
      (plugin.isSingleton ||
        this.primaryKeyFields.every(
          primaryKeyField =>
            (this.options as any)[primaryKeyField] ===
            (plugin.options as any)[primaryKeyField]
        ))
    );
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public addHooks(hooks: EngineHooks) {
    hooks.addHooks({
      "init:begin": this.#initBegin.bind(this)
    });
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  async #initBegin(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Adding required installations for the project.`
    );

    if (Object.keys(this.packageDeps).length > 0) {
      Object.keys(this.packageDeps).forEach(dependency => {
        if (
          this.packageDeps[dependency] &&
          (this.packageDeps[dependency] === "devDependency" ||
            context.options.projectType === "application")
        ) {
          if (
            dependency.lastIndexOf("@") > 0 &&
            dependency.substring(0, dependency.lastIndexOf("@")) in
              context.packageDeps
          ) {
            // Remove the existing dependency if it does not include the version
            // This is a workaround for the fact that we cannot install the same package with different versions
            delete context.packageDeps[
              dependency.substring(0, dependency.lastIndexOf("@"))
            ];
          }

          context.packageDeps[dependency] = this.packageDeps[dependency];
        }
      });
    }
  }
}
