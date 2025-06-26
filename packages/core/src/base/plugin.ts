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
import type { MaybePromise } from "@stryke/types/base";
import { extendLog } from "../helpers/utilities/logger";
import { writeFile } from "../helpers/utilities/write-file";
import { installPackage } from "../init/installs/utilities";
import type { Context, EngineHooks } from "../types/build";
import type { LogFn, PluginConfig } from "../types/config";
import type { IPlugin } from "../types/plugin";

/**
 * The base class for all plugins
 */
export abstract class Plugin implements IPlugin {
  /**
   * The logger function to use
   */
  log: LogFn;

  /**
   * The name of the plugin
   */
  public name: string;

  /**
   * The name of the plugin
   */
  public installPath: string;

  /**
   * A list of plugin modules required as dependencies by the current Plugin.
   *
   * @remarks
   * These plugins will be called prior to the current Plugin.
   */
  public dependencies = [] as Array<string | PluginConfig>;

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
   * @param log - The logger function to use
   * @param name - The name of the plugin
   * @param installPath - The path to install the plugin
   */
  public constructor(log: LogFn, name: string, installPath?: string) {
    this.name = name.toLowerCase();
    if (this.name.startsWith("plugin-")) {
      this.name = this.name.replace(/^plugin-/, "").trim();
    } else if (this.name.endsWith("-plugin")) {
      this.name = this.name.replace(/-plugin$/, "").trim();
    }

    this.log = extendLog(log, `${this.name}-plugin`);

    this.installPath = installPath || `@storm-stack/plugin-${this.name}`;
    if (!installPath) {
      this.log(
        LogLevelLabel.WARN,
        `No install path parameter provided to constructor for ${this.name} plugin. Will attempt to use "${this.installPath}".`
      );
    }
  }

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
