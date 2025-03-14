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
import { writeFile } from "@stryke/fs/write-file";
import { hash } from "@stryke/hash/hash";
import { findFilePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type { MaybePromise } from "@stryke/types/base";
import { defu } from "defu";
import { format, resolveConfig } from "prettier";
import { Compiler } from "./compiler";
import { getParsedTypeScriptConfig, installPackage } from "./helpers";
import { getUnbuildLoader } from "./helpers/unbuild-loader";
import { createLog } from "./helpers/utilities/logger";
import type { EngineHooks, InferResolvedOptions, Options } from "./types/build";
import type { LogFn, PluginConfig } from "./types/config";
import type { IPlugin } from "./types/plugin";

export abstract class Plugin<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> implements IPlugin<TOptions, TResolvedOptions>
{
  #compiler: Compiler;

  /**
   * The name of the plugin
   */
  public name: string;

  /**
   * The name of the plugin
   */
  public installPath: string;

  /**
   * A list of plugin modules required as dependencies by the current plugin.
   *
   * @remarks
   * These plugins will be called prior to the current plugin.
   */
  public dependencies = [] as Array<string | PluginConfig>;

  /**
   * The logger function to use
   */
  public log: LogFn;

  public async getCompiler(options: TResolvedOptions): Promise<Compiler> {
    if (!this.#compiler) {
      const tsconfig = await getParsedTypeScriptConfig(options);
      this.#compiler = new Compiler(
        options,
        joinPaths(findFilePath(options.envPaths.cache), hash(tsconfig.options)),
        tsconfig
      );
    }

    return this.#compiler;
  }

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
  public abstract addHooks(
    hooks: EngineHooks<TOptions, TResolvedOptions>
  ): MaybePromise<void>;

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
    if (skipFormat) {
      return writeFile(filepath, content);
    }

    const config = (await resolveConfig(filepath)) ?? {};
    await writeFile(
      filepath,
      await format(content, {
        ...config,
        filepath
      })
    );
  }

  protected async install(
    options: TResolvedOptions,
    packageName: string,
    dev = false
  ) {
    return installPackage<TOptions>(this.log, options, packageName, dev);
  }

  protected async build(options: TResolvedOptions) {
    this.log(LogLevelLabel.TRACE, "Building Storm Stack project");

    if (
      options.projectType === "library" ||
      options.projectType === "adapter"
    ) {
      await this.buildLib(options);
    } else {
      await this.buildApp(options);
    }
  }

  /**
   * Run the build process for application projects
   *
   * @param _options - The resolved Storm Stack options
   */
  protected async buildApp(_options: TResolvedOptions) {
    this.log(
      LogLevelLabel.WARN,
      "Skipping build for project - this plugin does not support application builds"
    );
  }

  /**
   * Run the unbuild process for library builds
   *
   * @param options - The unbuild options
   */
  protected async buildLib(options: TResolvedOptions) {
    const compiler = await this.getCompiler(options);

    return unbuild(
      defu(options.override, {
        projectRoot: options.projectRoot,
        outputPath: options.outputPath || "dist",
        platform: options.platform,
        generatePackageJson: true,
        minify: Boolean(options.minify),
        sourcemap: options.mode === "production",
        loaders: [getUnbuildLoader(compiler)],
        env: options.resolvedDotenv.values as {
          [key: string]: string;
        }
      }) as UnbuildOptions
    );
  }
}
