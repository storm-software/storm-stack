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
import { PluginConfig } from "@storm-stack/core/types/config";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { StoragePluginOptions } from "@storm-stack/devkit/plugins/storage";
import { joinPaths } from "@stryke/path/join-paths";
import { ConfigModule } from "./templates/config";
import { NodeConfigPluginContext, NodeConfigPluginOptions } from "./types";

/**
 * Storm Stack - Node Configuration plugin.
 */
export default class NodeConfigPlugin<
  TConfig extends NodeConfigPluginOptions = NodeConfigPluginOptions,
  TContext extends NodeConfigPluginContext = NodeConfigPluginContext
> extends Plugin<TConfig, TContext> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TConfig>) {
    super(options);

    this.dependencies = [
      ["@storm-stack/plugin-config", options ?? {}],
      ["@storm-stack/plugin-error", options.error ?? {}],
      options.storage ?? [
        "@storm-stack/plugin-storage-fs",
        {
          namespace: "config",
          envPath: "config"
        }
      ]
    ].filter(Boolean) as [string, PluginConfig<StoragePluginOptions>][];
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
   * @param _context - The context of the current build.
   */
  protected initOptions(_context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the Configuration plugin options for the Storm Stack project.`
    );
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareRuntime(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the NodeJs Configuration runtime artifacts for the Storm Stack project.`
    );

    await context.vfs.writeRuntimeFile(
      "config",
      joinPaths(context.runtimePath, "config.ts"),
      await ConfigModule(context)
    );

    // await context.vfs.writeFile(
    //   joinPaths(context.artifactsPath, "schemas", "config.capnp"),
    //   await generateSchema(context)
    // );

    // const result = await compile(context);
    // for (const [fileName, content] of result.files) {
    //   await context.vfs.writeFile(
    //     joinPaths(context.artifactsPath, "schemas", findFileName(fileName)),
    //     // https://github.com/microsoft/TypeScript/issues/54632
    //     content.replace(/^\s+/gm, match => " ".repeat(match.length / 2))
    //   );
    // }
  }
}
