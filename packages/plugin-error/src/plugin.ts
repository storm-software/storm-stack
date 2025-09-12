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
import { STORM_DEFAULT_ERROR_CODES_FILE } from "@storm-software/config/constants";
import { Plugin } from "@storm-stack/core/base/plugin";
import { addPluginFilter } from "@storm-stack/core/lib/babel/helpers";
import type { EngineHooks } from "@storm-stack/core/types/build";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { isAbsolutePath } from "@stryke/path/is-type";
import { joinPaths } from "@stryke/path/join-paths";
import StormErrorBabelPlugin from "./babel/plugin";
import { ErrorModule } from "./templates/error";
import {
  ErrorPluginContext,
  ErrorPluginOptions,
  ErrorPluginResolvedOptions
} from "./types";

/**
 * Storm Stack - Error plugin.
 */
export default class ErrorPlugin<
  TContext extends ErrorPluginContext = ErrorPluginContext,
  TOptions extends ErrorPluginOptions = ErrorPluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.dependencies = [["@storm-stack/plugin-env", options.env ?? {}]];

    this.packageDeps = {};
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:options": this.initOptions.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this)
    });
  }

  /**
   * Initializes the plugin's options.
   *
   * @remarks
   * This method is called during the initialization phase of the plugin. It can be used to set default options or modify existing ones.
   *
   * @param context - The context of the current build.
   */
  protected initOptions(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the Error plugin options for the Storm Stack project.`
    );

    context.options.babel.plugins ??= [];
    context.options.babel.plugins.push(
      addPluginFilter(
        context,
        StormErrorBabelPlugin,
        sourceFile => !context.vfs.isMatchingRuntimeId("error", sourceFile.id)
      )
    );

    context.options.plugins.error ??= {} as ErrorPluginResolvedOptions["error"];
    context.options.plugins.error.codesFile ??=
      this.options.codesFile ||
      context.options.workspaceConfig.error?.codesFile ||
      STORM_DEFAULT_ERROR_CODES_FILE;
    if (!isAbsolutePath(context.options.plugins.error.codesFile)) {
      context.options.plugins.error.codesFile = joinPaths(
        context.options.workspaceRoot,
        context.options.plugins.error.codesFile
      );
    }
    context.options.plugins.error.url ??=
      this.options.url || context.options.workspaceConfig.error?.url;

    context.options.workspaceConfig.error = {
      codesFile: context.options.plugins.error.codesFile,
      url: context.options.plugins.error.url
    };
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareRuntime(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the StormError runtime artifacts for the Storm Stack project.`
    );

    await context.vfs.writeRuntimeFile(
      "error",
      joinPaths(context.runtimePath, "error.ts"),
      ErrorModule(context)
    );
  }
}
