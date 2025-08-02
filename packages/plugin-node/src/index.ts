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
import type { EngineHooks } from "@storm-stack/core/types/build";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { IdModule } from "@storm-stack/devkit/templates/id";
import { LogModule } from "@storm-stack/devkit/templates/log";
import { PayloadModule } from "@storm-stack/devkit/templates/payload";
import { StorageModule } from "@storm-stack/devkit/templates/storage";
import { joinPaths } from "@stryke/path/join-paths";
import BabelPlugin from "./babel/plugin";
import { AppModule } from "./templates/app";
import { ContextModule } from "./templates/context";
import { EnvModule } from "./templates/env";
import { EventModule } from "./templates/event";
import { ResultModule } from "./templates/result";
import {
  NodePluginConfig,
  NodePluginContext,
  NodePluginContextOptions
} from "./types";

/**
 * NodeJs Storm Stack plugin.
 */
export default class NodePlugin<
  TConfig extends NodePluginConfig = NodePluginConfig
> extends Plugin<TConfig> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TConfig>) {
    super(options);

    this.dependencies = [
      ["@storm-stack/plugin-dotenv", this.options.dotenv],
      ["@storm-stack/plugin-error", this.options.error],
      ["@storm-stack/plugin-log-console", this.options.logs?.console]
    ];

    this.packageDeps = {};
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public override addHooks(hooks: EngineHooks) {
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
  protected initOptions(context: NodePluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the NodeJs plugin options for the Storm Stack project.`
    );

    context.options.platform = "node";
    context.options.esbuild.target = "node22";

    context.options.esbuild.override ??= {};

    context.options.babel.plugins ??= [];
    context.options.babel.plugins.push(BabelPlugin);

    context.options.plugins.logs ??= this.options
      .logs as NodePluginContextOptions["logs"];
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareRuntime(context: NodePluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the NodeJs runtime artifacts for the Storm Stack project.`
    );

    const promises = [
      context.vfs.writeRuntimeFile(
        "id",
        joinPaths(context.runtimePath, "id.ts"),
        IdModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "log",
        joinPaths(context.runtimePath, "log.ts"),
        LogModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "storage",
        joinPaths(context.runtimePath, "storage.ts"),
        StorageModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "payload",
        joinPaths(context.runtimePath, "payload.ts"),
        PayloadModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "app",
        joinPaths(context.runtimePath, "app.ts"),
        AppModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "context",
        joinPaths(context.runtimePath, "context.ts"),
        ContextModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "env",
        joinPaths(context.runtimePath, "env.ts"),
        EnvModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "event",
        joinPaths(context.runtimePath, "event.ts"),
        EventModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "result",
        joinPaths(context.runtimePath, "result.ts"),
        ResultModule(context)
      )
    ];

    await Promise.all(promises);
  }
}
