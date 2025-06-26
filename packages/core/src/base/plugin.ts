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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { kebabCase } from "@stryke/string-format/kebab-case";
import type { MaybePromise } from "@stryke/types/base";
import { createLog, extendLog } from "../helpers/utilities/logger";
import { writeFile } from "../helpers/utilities/write-file";
import { installPackage } from "../init/installs/utilities";
import type { Context, EngineHooks } from "../types/build";
import type { LogFn, PluginConfig } from "../types/config";
import type { IPlugin } from "../types/plugin";

export type PluginOptions<
  TOptions extends Record<string, any> = Record<string, any>
> = TOptions & { log?: LogFn };

/**
 * The base class for all plugins
 */
export abstract class Plugin<
  TOptions extends Record<string, any> = Record<string, any>
> implements IPlugin
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
   * The logger function to use
   */
  protected get log(): LogFn {
    if (!this.#log) {
      this.#log = createLog(`${this.name}-plugin`);
    }

    return this.#log;
  }

  /**
   * The configuration options for the plugin
   *
   * @remarks
   * This is used to store the configuration options for the plugin, which can be accessed by the plugin's methods.
   */
  protected options: TOptions;

  /**
   * The renderer used by the plugin
   *
   * @remarks
   * This is used to render generated output files during various Storm Stack processes. Some possible items rendered include (but are not limited to): source code, documentation, DevOps configuration, and deployment infrastructure/IOC.
   */
  // protected abstract renderer: Renderer;

  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    if (options.log) {
      this.#log = extendLog(options.log, `${this.name}-plugin`);
    }

    this.options = options;
  }

  /**
   * Adds the plugin's hooks into the engine.
   *
   * @param hooks - The list of engine hooks to add the plugin's hooks to.
   */
  public async addHooks(hooks: EngineHooks) {
    this.log(LogLevelLabel.TRACE, `Adding plugin hooks into engine`);

    hooks.addHooks({
      "init:context": this.#initContext.bind(this)
    });

    return this.innerAddHooks(hooks);
  }

  /**
   * Function to add hooks into the Storm Stack engine
   */
  public abstract innerAddHooks(hooks: EngineHooks): MaybePromise<void>;

  /**
   * Writes a file to the file system
   *
   * @param filepath - The file path to write the file
   * @param content - The content to write to the file
   * @param skipFormat - Should the plugin skip formatting the `content` string with Prettier
   */
  protected async writeFile(
    filepath: string,
    content: string,
    skipFormat = false
  ) {
    this.log(LogLevelLabel.TRACE, `Writing file ${filepath} to disk`);

    return writeFile(this.log, filepath, content, skipFormat);
  }

  /**
   * Installs a package if it is not already installed.
   *
   * @param context - The resolved Storm Stack context
   * @param packageName - The name of the package to install
   * @param dev - Whether to install the package as a dev dependency
   */
  protected async install(context: Context, packageName: string, dev = false) {
    return installPackage(this.log, context, packageName, dev);
  }

  async #initContext(_context: Context) {}
}
