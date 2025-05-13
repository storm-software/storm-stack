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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { MaybePromise } from "@stryke/types/base";
import { createLog } from "./helpers/utilities/logger";
import { writeFile } from "./helpers/utilities/write-file";
import { installPackage } from "./init/installs/utilities";
import type { Context, EngineHooks, Options } from "./types/build";
import type { LogFn, PluginConfig } from "./types/config";
import type { IPlugin } from "./types/plugin";

/**
 * The base class for all plugins
 */
export abstract class Plugin<TOptions extends Options = Options>
  implements IPlugin<TOptions>
{
  /**
   * The name of the plugin
   */
  public name: string;

  /**
   * The name of the plugin
   */
  public installPath: string;

  /**
   * The logger function to use
   */
  public log: LogFn;

  /**
   * A list of plugin modules required as dependencies by the current Preset.
   *
   * @remarks
   * These plugins will be called prior to the current Preset.
   */
  public dependencies = [] as Array<string | PluginConfig>;

  /**
   * The constructor for the plugin
   *
   * @param name - The name of the plugin
   * @param installPath - The path to install the plugin
   */
  public constructor(name: string, installPath?: string) {
    this.name = name.toLowerCase();
    if (this.name.startsWith("plugin-")) {
      this.name = this.name.replace(/^plugin-/, "").trim();
    } else if (this.name.endsWith("-plugin")) {
      this.name = this.name.replace(/-plugin$/, "").trim();
    }

    this.log = createLog(`${this.name}-plugin`);
    this.installPath = installPath || `@storm-stack/plugin-${this.name}`;

    if (!installPath) {
      this.log(
        LogLevelLabel.WARN,
        `No install path parameter provided to constructor for ${this.name} plugin. Will attempt to use "${this.installPath}".`
      );
    }
  }

  /**
   * Function to add hooks into the Storm Stack engine
   */
  public abstract addHooks(hooks: EngineHooks<TOptions>): MaybePromise<void>;

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
  protected async install(
    context: Context<TOptions>,
    packageName: string,
    dev = false
  ) {
    return installPackage<TOptions>(this.log, context, packageName, dev);
  }
}
