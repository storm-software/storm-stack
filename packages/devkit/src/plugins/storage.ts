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

import { PrimaryKey } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";
import type {
  Context,
  EngineHooks,
  PluginBaseConfig
} from "@storm-stack/core/types";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import type { MaybePromise } from "@stryke/types/base";

export interface StoragePluginConfig extends PluginBaseConfig {
  namespace: string & PrimaryKey;
}

/**
 * Base class for Storage plugins in Storm Stack.
 *
 * @remarks
 * This class provides the foundation for creating storage plugins in Storm Stack. It handles the initialization of the plugin's context and prepares the runtime for storage artifacts. Derived classes must implement the `writeStorage` method to define how the storage should be written.
 */
export default abstract class StoragePlugin<
  TConfig extends StoragePluginConfig = StoragePluginConfig
> extends Plugin<TConfig> {
  /**
   * A list of primary keys for the plugin's options.
   *
   * @remarks
   * This is used to identify when two instances of the plugin are the same and can be de-duplicated.
   */
  protected override get primaryKeyFields(): string[] {
    return ["namespace"];
  }

  protected get storageName() {
    return `${this.name.replace(/^storage-/, "")}${
      this.options.namespace
        ? `-${this.options.namespace
            .replaceAll(".", "-")
            .replaceAll(":", "-")
            .replaceAll(" ", "-")}`
        : ""
    }`;
  }

  public constructor(options: PluginOptions<TConfig>) {
    super(options);

    if (!this.options.namespace) {
      throw new Error(
        `The \`namespace\` configuration parameter was not provided to the ${
          this.name
        } plugin.`
      );
    }
  }

  /**
   * Adds the plugin's hooks to the engine.
   *
   * @param hooks - The engine hooks to add the plugin's hooks to.
   */
  public override addHooks(hooks: EngineHooks) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:complete": this.#initComplete.bind(this),
      "prepare:runtime": this.#prepareRuntime.bind(this)
    });
  }

  /**
   * Allow derived classes to prepare the storage runtime source code.
   *
   * @param context - The context to use
   */
  protected abstract writeStorage(context: Context): MaybePromise<string>;

  async #prepareRuntime(context: Context) {
    this.log(LogLevelLabel.TRACE, `Prepare the Storm Stack storage artifact.`);

    if (context.options.projectType === "application") {
      const namespace = this.options.namespace
        ?.replaceAll(".", "-")
        .replaceAll(":", "-")
        .replaceAll(" ", "-");
      if (!namespace) {
        throw new Error(
          `The namespace for the ${
            this.name
          } plugin is not defined. Please set the namespace option in the plugin configuration.`
        );
      }

      await context.vfs.writeRuntimeFile(
        `storage/${kebabCase(this.storageName)}`,
        joinPaths(
          context.runtimePath,
          "storage",
          `${kebabCase(this.storageName)}.ts`
        ),
        await Promise.resolve(this.writeStorage(context))
      );
    }
  }

  async #initComplete(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Loading the ${this.name} plugin into the context.`
    );

    if (context.options.projectType === "application") {
      const name = `${camelCase(this.storageName)}Storage`;
      context.runtime.storage.push({
        name,
        namespace: this.options.namespace,
        fileName: joinPaths("storage", kebabCase(this.storageName))
      });
    }
  }
}
