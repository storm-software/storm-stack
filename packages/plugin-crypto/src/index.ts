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
import { joinPaths } from "@stryke/path/join-paths";
import { CryptoModule } from "./templates/crypto";
import { CryptoPluginConfig, CryptoPluginContext } from "./types";

/**
 * Storm Stack - Cryptography plugin.
 */
export default class CryptoPlugin<
  TConfig extends CryptoPluginConfig = CryptoPluginConfig
> extends Plugin<TConfig> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TConfig>) {
    super(options);

    this.dependencies = [
      ["@storm-stack/plugin-dotenv", options.dotenv ?? {}],
      ["@storm-stack/plugin-error", options.error ?? {}]
    ];

    this.packageDeps = {
      "@oslojs/encoding": "dependency"
    };
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
  protected initOptions(context: CryptoPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the Cryptography plugin options for the Storm Stack project.`
    );

    context.options.encryptionKey = this.options.encryptionKey;
    context.options.dotenv.values.ENCRYPTION_KEY =
      context.options.encryptionKey;
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareRuntime(context: CryptoPluginContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Cryptography runtime artifacts for the Storm Stack project.`
    );

    await context.vfs.writeRuntimeFile(
      "crypto",
      joinPaths(context.runtimePath, "crypto.ts"),
      CryptoModule(context)
    );
  }
}
