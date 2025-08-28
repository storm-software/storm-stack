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
import { PluginOptions } from "@storm-stack/core/types/plugin";
import {
  readConfigTypeReflection,
  writeConfigTypeReflection
} from "@storm-stack/plugin-config/helpers/persistence";
import { joinPaths } from "@stryke/path/join-paths";
import {
  buildApplication,
  buildLibrary,
  permissionExecutable
} from "./helpers/build";
import {
  initEntry,
  initInstalls,
  initOptions,
  initReflections,
  initTsconfig
} from "./helpers/init";
import {
  addCommandArgReflections,
  generateCompletionCommands,
  prepareEntry
} from "./helpers/prepare";
import { reflectCommandTree } from "./helpers/reflect-command";
import { AppModule } from "./templates/app";
import { CLIModule } from "./templates/cli";
import type { CLIPluginContext, CLIPluginOptions } from "./types/config";

/**
 * The CLI Plugin for Storm Stack projects.
 */
export default class CLIPlugin<
  TOptions extends CLIPluginOptions = CLIPluginOptions,
  TContext extends CLIPluginContext = CLIPluginContext
> extends Plugin<TOptions, TContext> {
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.options = { minNodeVersion: 20, ...options };
    this.dependencies = [
      ["@storm-stack/plugin-node", this.options],
      ["@storm-stack/plugin-node-config", this.options.config],
      ["@storm-stack/plugin-date", this.options.date],
      [
        "@storm-stack/plugin-storage-fs",
        {
          namespace: "crash-reports",
          base: "crash-reports",
          envPath: "log"
        }
      ]
    ];
  }

  /**
   * Adds the plugin's hooks to the engine.
   *
   * @param hooks - The engine hooks to add the plugin's hooks to.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
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
  protected async initOptions(context: TContext) {
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
  protected async initInstall(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Adding CLI specific dependencies to the Storm Stack project.`
    );

    await initInstalls(context);
  }

  /**
   * Initializes the TypeScript configuration for the Storm Stack project.
   *
   * @param context - The context to initialize the TypeScript configuration with.
   */
  protected async initTsconfig(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing TypeScript configuration for the Storm Stack project.`
    );

    await initTsconfig(context);
  }

  /**
   * Initializes the entry point for the CLI application.
   *
   * @param context - The context to initialize the entry point with.
   */
  protected async initEntry(context: TContext) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Initializing CLI application's entry point and commands.`
      );

      await initEntry(this.log, context);
    }
  }

  /**
   * Initializes the reflection data for the CLI application.
   *
   * @param context - The context to initialize the reflections with.
   */
  protected async initReflections(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the CLI application's reflection data.`
    );

    await initReflections(this.log, context);
  }

  /**
   * Prepares the runtime artifacts for the CLI application.
   *
   * @param context - The context to prepare the runtime with.
   */
  protected async prepareRuntime(context: TContext) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the CLI application's runtime artifacts.`
      );

      await Promise.all([
        context.vfs.writeRuntimeFile(
          "app",
          joinPaths(context.runtimePath, "app.ts"),
          AppModule(context)
        ),
        context.vfs.writeRuntimeFile(
          "cli",
          joinPaths(context.runtimePath, "cli.ts"),
          CLIModule(context)
        )
      ]);
    }
  }

  /**
   * Prepares the entry point for the CLI application.
   *
   * @param context - The context to prepare the entry point with.
   */
  protected async prepareEntry(context: TContext) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the CLI application's entry point and commands.`
      );

      await Promise.all([
        // generateConfigCommands(this.log, context, this.options),
        generateCompletionCommands(this.log, context)
      ]);

      const commandTree = await reflectCommandTree(this.log, context);

      this.log(
        LogLevelLabel.TRACE,
        `Writing the CLI application entry points.`
      );

      context.reflections.config.types.params = await readConfigTypeReflection(
        context,
        "params"
      );

      const originalNumberOfProperties =
        context.reflections.config.types.params?.getProperties().length || 0;

      for (const command of Object.values(commandTree.children)) {
        await addCommandArgReflections(context, command);
      }

      this.log(
        LogLevelLabel.TRACE,
        `Adding ${
          (context.reflections.config.params?.getProperties().length || 0) -
          originalNumberOfProperties
        } config properties for the CLI commands.`
      );

      await writeConfigTypeReflection(
        context,
        context.reflections.config.params,
        "params"
      );

      await prepareEntry(this.log, context, commandTree);
    }
  }

  /**
   * Runs a library build for the CLI project.
   *
   * @param context - The context to build the library with.
   */
  protected async buildLibrary(context: TContext) {
    return buildLibrary(this.log, context);
  }

  /**
   * Runs an application build for the CLI project.
   *
   * @param context - The context to build the application with.
   */
  protected async buildApplication(context: TContext) {
    return buildApplication(this.log, context);
  }

  /**
   * Builds the complete CLI application, including permissions.
   *
   * @param context - The context to build the complete application with.
   */
  protected async buildComplete(context: TContext) {
    return permissionExecutable(this.log, context);
  }
}
