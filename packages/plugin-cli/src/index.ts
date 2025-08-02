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
import type { EngineHooks } from "@storm-stack/core/types";
import { PluginConfig } from "@storm-stack/core/types/config";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import {
  readDotenvReflection,
  writeDotenvReflection
} from "@storm-stack/plugin-dotenv/helpers/persistence";
import { joinPaths } from "@stryke/path/join-paths";
import { isSetString } from "@stryke/type-checks/is-set-string";
import {
  buildApplication,
  buildLibrary,
  permissionExecutable
} from "./helpers/build";
import {
  initEntry,
  initInstalls,
  initOptions,
  initTsconfig
} from "./helpers/init";
import {
  addCommandArgReflections,
  generateCompletionCommands,
  generateConfigCommands,
  prepareEntry
} from "./helpers/prepare";
import { reflectCommandTree } from "./helpers/reflect-command";
import { AppModule } from "./templates/app";
import { CLIModule } from "./templates/cli";
import type { CLIPluginConfig, CLIPluginContext } from "./types/config";

/**
 * The CLI Plugin for Storm Stack projects.
 */
export default class CLIPlugin<
  TConfig extends CLIPluginConfig = CLIPluginConfig
> extends Plugin<TConfig> {
  public constructor(options: PluginOptions<TConfig>) {
    super(options);

    this.options = { minNodeVersion: 20, ...options };
    this.dependencies = [
      ["@storm-stack/plugin-node", this.options],
      [
        "@storm-stack/plugin-storage-fs",
        {
          namespace: "crash-reports",
          base: "crash-reports",
          envPath: "log"
        }
      ],
      this.options.manageConfig !== false && [
        "@storm-stack/plugin-storage-fs",
        {
          namespace: "config",
          base:
            isSetString(this.options.bin) ||
            (Array.isArray(this.options.bin) && this.options.bin.length > 0)
              ? isSetString(this.options.bin)
                ? this.options.bin
                : this.options.bin[0]
              : undefined,
          envPath: "config"
        }
      ]
    ].filter(Boolean) as (string | PluginConfig)[];
  }

  /**
   * Adds the plugin's hooks to the engine.
   *
   * @param hooks - The engine hooks to add the plugin's hooks to.
   */
  public override addHooks(hooks: EngineHooks) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:options": this.initOptions.bind(this),
      "init:install": this.initInstall.bind(this),
      "init:entry": this.initEntry.bind(this),
      "init:reflections": this.initReflections.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "build:library": this.buildLibrary.bind(this),
      "build:application": this.buildApplication.bind(this),
      "build:complete": this.buildComplete.bind(this)
    });
  }

  /**
   * Initializes the plugin with the provided context.
   *
   * @param context - The context to initialize the plugin with.
   */
  protected async initOptions(context: CLIPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing CLI specific options for the Storm Stack project.`
    );

    await initOptions(context, this.options);
  }

  /**
   * Initializes the installation of CLI specific dependencies.
   *
   * @param context - The context to initialize the installation with.
   */
  protected async initInstall(context: CLIPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Adding CLI specific dependencies to the Storm Stack project.`
    );

    await initInstalls(context, this.options);
  }

  /**
   * Initializes the TypeScript configuration for the Storm Stack project.
   *
   * @param context - The context to initialize the TypeScript configuration with.
   */
  protected async initTsconfig(context: CLIPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing TypeScript configuration for the Storm Stack project.`
    );

    await initTsconfig(context, this.options);
  }

  /**
   * Initializes the entry point for the CLI application.
   *
   * @param context - The context to initialize the entry point with.
   */
  protected async initEntry(context: CLIPluginContext) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Initializing CLI application's entry point and commands.`
      );

      await initEntry(this.log, context, this.options);
    }
  }

  /**
   * Initializes the reflection data for the CLI application.
   *
   * @param _context - The context to initialize the reflections with.
   */
  protected async initReflections(_context: CLIPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the CLI application's reflection data.`
    );
  }

  /**
   * Prepares the runtime artifacts for the CLI application.
   *
   * @param context - The context to prepare the runtime with.
   */
  protected async prepareRuntime(context: CLIPluginContext) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the CLI application's runtime artifacts.`
      );

      await Promise.all([
        context.vfs.writeRuntimeFile(
          "app",
          joinPaths(context.runtimePath, "app.ts"),
          AppModule(context, this.options)
        ),
        context.vfs.writeRuntimeFile(
          "cli",
          joinPaths(context.runtimePath, "cli.ts"),
          CLIModule(context, this.options)
        )
      ]);
    }
  }

  /**
   * Prepares the entry point for the CLI application.
   *
   * @param context - The context to prepare the entry point with.
   */
  protected async prepareEntry(context: CLIPluginContext) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the CLI application's entry point and commands.`
      );

      await Promise.all([
        generateConfigCommands(this.log, context, this.options),
        generateCompletionCommands(this.log, context, this.options)
      ]);

      const commandTree = await reflectCommandTree(
        this.log,
        context,
        this.options
      );

      this.log(
        LogLevelLabel.TRACE,
        `Writing the CLI application entry points.`
      );

      // const commandTree = await readCommandTreeReflection(
      //   context,
      //   this.options
      // );

      context.reflections.configDotenv = await readDotenvReflection(
        context,
        "config"
      );

      const originalNumberOfProperties =
        context.reflections.configDotenv?.getProperties().length || 0;

      for (const command of Object.values(commandTree.children)) {
        await addCommandArgReflections(context, command);
      }

      this.log(
        LogLevelLabel.TRACE,
        `Adding ${
          (context.reflections.configDotenv?.getProperties().length || 0) -
          originalNumberOfProperties
        } dotenv properties for the CLI commands.`
      );

      await writeDotenvReflection(
        context,
        context.reflections.configDotenv,
        "config"
      );

      await prepareEntry(this.log, context, this.options, commandTree);
    }
  }

  /**
   * Runs a library build for the CLI project.
   *
   * @param context - The context to build the library with.
   */
  protected async buildLibrary(context: CLIPluginContext) {
    return buildLibrary(this.log, context);
  }

  /**
   * Runs an application build for the CLI project.
   *
   * @param context - The context to build the application with.
   */
  protected async buildApplication(context: CLIPluginContext) {
    return buildApplication(this.log, context);
  }

  /**
   * Builds the complete CLI application, including permissions.
   *
   * @param context - The context to build the complete application with.
   */
  protected async buildComplete(context: CLIPluginContext) {
    return permissionExecutable(this.log, context);
  }
}
