/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { PluginOptions } from "@storm-stack/core/base/plugin";
import type { Context, EngineHooks } from "@storm-stack/core/types";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import type { MaybePromise } from "@stryke/types/base";
import LibraryPlugin from "./library";

export interface StoragePluginConfig {
  namespace: string;
}

/**
 * Base class for Storage plugins in Storm Stack.
 *
 * @remarks
 * This class provides the foundation for creating storage plugins in Storm Stack. It handles the initialization of the plugin's context and prepares the runtime for storage artifacts. Derived classes must implement the `writeStorage` method to define how the storage should be written.
 */
export default abstract class StoragePlugin<
  TOptions extends StoragePluginConfig = StoragePluginConfig
> extends LibraryPlugin<TOptions> {
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    if (!this.options.namespace) {
      throw new Error(
        `The \`namespace\` configuration parameter was not provided to the ${this.name} plugin.`
      );
    }
  }

  /**
   * Adds the plugin's hooks to the engine.
   *
   * @param hooks - The engine hooks to add the plugin's hooks to.
   */
  public override innerAddHooks(hooks: EngineHooks) {
    super.innerAddHooks(hooks);

    hooks.addHooks({
      "init:context": this.#initContext.bind(this),
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
      await this.writeFile(
        joinPaths(
          context.runtimePath,
          "storage",
          `${this.name.replace(/^storage-/, "")}-${this.options.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}.ts`
        ),
        await Promise.resolve(this.writeStorage(context))
      );
    }
  }

  async #initContext(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Loading the ${this.name} plugin into the context.`
    );

    if (context.options.projectType === "application") {
      const name = `${camelCase(`${this.name.replace(/^storage-/, "")}-${this.options.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}`)}Storage`;
      context.runtime.storage.push({
        name,
        namespace: this.options.namespace,
        import: `import ${name} from "./${joinPaths("storage", `${this.name.replace(/^storage-/, "")}-${this.options.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}`)}"; `
      });
    }
  }
}
