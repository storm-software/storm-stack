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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { UnbuildOptions } from "@storm-software/unbuild";
import { build as unbuild } from "@storm-software/unbuild";
import type { MaybePromise } from "@stryke/types/base";
import { defu } from "defu";
import { installPackage } from "./helpers";
import { getUnbuildLoader } from "./helpers/unbuild-loader";
import { createLog } from "./helpers/utilities/logger";
import { writeFile } from "./helpers/utilities/write-file";
import type { Context, EngineHooks, Options } from "./types/build";
import type { LogFn } from "./types/config";
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
   * The constructor for the plugin
   *
   * @param name - The name of the plugin
   * @param installPath - The path to install the plugin
   */
  public constructor(name: string, installPath?: string) {
    this.name = name.toLowerCase();
    if (this.name.endsWith("plugin")) {
      this.name = this.name.replace(/plugin$/, "").trim();
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
    return writeFile(filepath, content, skipFormat);
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

  /**
   * Builds the Storm Stack project
   *
   * @param context - The resolved Storm Stack context
   */
  protected async build(context: Context<TOptions>) {
    this.log(LogLevelLabel.TRACE, "Building Storm Stack project");

    if (
      context.projectType === "library" ||
      context.projectType === "adapter"
    ) {
      await this.buildLib(context);
    } else {
      await this.buildApp(context);
    }
  }

  /**
   * Run the build process for application projects
   *
   * @param _context - The resolved Storm Stack context
   */
  protected async buildApp(_context: Context<TOptions>) {
    this.log(
      LogLevelLabel.WARN,
      "Skipping build for project - this plugin does not support application builds"
    );
  }

  /**
   * Run the unbuild process for library builds
   *
   * @param context - The unbuild context
   */
  protected async buildLib(context: Context<TOptions>) {
    return unbuild(
      defu(context.override, {
        projectRoot: context.projectRoot,
        outputPath: context.outputPath || "dist",
        platform: context.platform,
        generatePackageJson: true,
        minify: Boolean(context.minify),
        sourcemap: context.mode === "production",
        loaders: [getUnbuildLoader<TOptions>(context)],
        env: context.resolvedDotenv.values as {
          [key: string]: string;
        }
      }) as UnbuildOptions
    );
  }
}
