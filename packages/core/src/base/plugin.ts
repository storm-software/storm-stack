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
import { isValidRange } from "@stryke/fs/semver-fns";
import { camelCase } from "@stryke/string-format/camel-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import {
  getPackageName,
  getPackageVersion
} from "@stryke/string-format/package";
import { titleCase } from "@stryke/string-format/title-case";
import { isObject } from "@stryke/type-checks/is-object";
import defu from "defu";
import { subset } from "semver";
import { createLog, extendLog } from "../lib/logger";
import type { EngineHooks } from "../types/build";
import type { LogFn, PluginConfig } from "../types/config";
import { Context } from "../types/context";
import type {
  PluginBaseOptions,
  PluginInterface,
  PluginOptions,
  PluginPackageDependencies
} from "../types/plugin";
import { __STORM_STACK_IS_PLUGIN__ } from "../types/plugin";

/**
 * The base class for all plugins
 */
export abstract class Plugin<
  TContext extends Context = Context,
  TOptions extends PluginBaseOptions = PluginBaseOptions
> implements PluginInterface<TContext, TOptions>
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
   * A property to identify the object as a Storm Stack Plugin.
   */
  public get [__STORM_STACK_IS_PLUGIN__](): true {
    return true;
  }

  /**
   * A list of dependencies that are required for the plugin to work. These dependencies will be installed when Storm Stack CLI is run.
   */
  protected packageDeps: PluginPackageDependencies = {};

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
   * The identifier for the plugin used in the {@link isSame} method
   *
   * @remarks
   * Child plugins can override this to provide a more or less specific identifier. This is used to identify the plugin's options in {@link Context.options}.
   */
  public get identifier(): string {
    return camelCase(
      `${this.primaryKeys.includes(this.name) ? "" : this.name}${
        this.isSingleton ? "" : `-${this.primaryKeys.join("-")}`
      }`
    );
  }

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
   * A list of primary keys for the plugin's options.
   *
   * @remarks
   * This is used to identify when a two instances of the plugin are the same and can be de-duplicated.
   */
  protected get primaryKeyFields(): string[] {
    return this.#primaryKeyFields ?? [];
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
   * Gets the resolved options for the plugin.
   *
   * @param context - The context to use
   * @returns The resolved options for the plugin
   */
  protected getOptions(context: TContext): TOptions {
    context.options.plugins ??= {};
    context.options.plugins[this.identifier] ??= {} as TOptions;

    return context.options.plugins[this.identifier] as TOptions;
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
      context.packageDeps = Object.entries(
        this.packageDeps
      ).reduce<PluginPackageDependencies>((ret, [dependency, value]) => {
        const packageName = getPackageName(dependency);

        const currentVersion =
          getPackageVersion(dependency) ||
          (isObject(value) ? value.version : undefined);
        const currentType = isObject(value) ? value.type : value;

        const match = Object.keys(ret).find(
          dep => getPackageName(dep) === packageName
        );
        if (match) {
          const matchedVersion =
            getPackageVersion(match) ||
            (isObject(ret[match]) ? ret[match].version : undefined);
          const matchedType = isObject(ret[match])
            ? ret[match].type
            : ret[match];

          const type =
            currentType === "dependency" || matchedType === "dependency"
              ? "dependency"
              : currentType || matchedType;

          if (currentVersion || matchedVersion) {
            if (!currentVersion || !isValidRange(currentVersion)) {
              ret[packageName] = {
                version: matchedVersion,
                type
              };
            } else if (!matchedVersion || !isValidRange(matchedVersion)) {
              ret[packageName] = {
                version: currentVersion,
                type
              };
            } else {
              ret[packageName] = {
                version: subset(matchedVersion, currentVersion)
                  ? matchedVersion
                  : currentVersion,
                type
              };
            }
          }

          if (match !== packageName) {
            delete ret[match];
          }
        } else {
          ret[dependency] = value;
        }

        return ret;
      }, {} as PluginPackageDependencies);
    }
  }
}
