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
import { camelCase } from "@stryke/string-format/camel-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import defu from "defu";
import { createLog, extendLog } from "../lib/logger";
import type { EngineHooks } from "../types/build";
import type { LogFn, PluginConfig } from "../types/config";
import { Context } from "../types/context";
import type {
  PluginBaseOptions,
  PluginInterface,
  PluginOptions
} from "../types/plugin";

/**
 * The base class for all plugins
 */
export abstract class Plugin<
  TOptions extends PluginBaseOptions = PluginBaseOptions,
  TContext extends Context = Context
> implements PluginInterface<TOptions>
{
  #log?: LogFn;

  #primaryKeyFields: string[] = [];

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
  public options: PluginOptions<TOptions>;

  /**
   * A list of dependencies that are required for the plugin to work. These dependencies will be installed when Storm Stack CLI is run.
   */
  protected packageDeps: Record<string, "dependency" | "devDependency"> = {};

  /**
   * A property to override the plugin's {@link name} field.
   *
   * @remarks
   * This is useful for plugins that need to have a different name than the default one derived from the class name.
   */
  protected get overrideName(): string | undefined {
    return undefined;
  }

  /**
   * The name of the plugin
   *
   * @remarks
   * This is used to identify the plugin's name used in {@link Context.options}, logs, and other output.
   */
  public get name(): string {
    let name = kebabCase(this.overrideName || this.constructor.name);
    if (name.startsWith("plugin-")) {
      name = name.replace(/^plugin-/g, "").trim();
    }
    if (name.endsWith("-plugin")) {
      name = name.replace(/-plugin$/g, "").trim();
    }

    return name;
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
    return this.#primaryKeyFields ?? [];
  }

  /**
   * The identifier for the plugin used in the {@link isSame} method
   *
   * @remarks
   * Child plugins can override this to provide a more or less specific identifier. This is used to identify the plugin's options in {@link Context.options}.
   */
  public get identifier(): string {
    return camelCase(
      `${this.name}${this.isSingleton ? "" : `-${this.primaryKeys.join("-")}`}`
    );
  }

  /**
   * The logger function to use
   */
  protected get log(): LogFn {
    if (!this.#log) {
      this.#log = this.options.log
        ? extendLog(this.options.log, titleCase(`${this.name} Plugin`))
        : createLog(titleCase(`${this.name} Plugin`));
    }

    return this.#log;
  }

  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    this.options = options;

    // try {
    //   this.#primaryKeyFields = ReflectionClass.from<TOptions>()
    //     .getPrimaries()
    //     .map(property => property.name)
    //     .toSorted();
    // } catch (error) {
    //   this.log(
    //     LogLevelLabel.ERROR,
    //     `Failed to get primary key of plugin options: ${error.message}`
    //   );

    //   this.#primaryKeyFields = [];
    // }
  }

  /**
   * Checks if the current plugin is the same as another plugin based on primary key fields.
   *
   * @param plugin - The plugin to compare with.
   * @returns `true` if the plugins are the same, `false` otherwise.
   */
  public isSame(plugin: PluginInterface): boolean {
    return (
      this.identifier === plugin.identifier ||
      (this.name === plugin.name && this.isSingleton && plugin.isSingleton)
    );
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public addHooks(hooks: EngineHooks<TContext>) {
    hooks.addHooks({
      "init:begin": this.#initBegin.bind(this)
    });
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  async #initBegin(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Adding required installations for the project.`
    );

    this.options = defu(
      this.options,
      context.options.plugins[this.identifier] ?? {}
    ) as PluginOptions<TOptions>;

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
