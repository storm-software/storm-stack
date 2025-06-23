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
import type { Context, EngineHooks } from "@storm-stack/core/types";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import type { MaybePromise } from "@stryke/types/base";
import LibraryPlugin from "./library";

export interface StoragePluginConfig {
  namespace: string;
}

export default abstract class StoragePlugin extends LibraryPlugin {
  public constructor(
    protected override config: StoragePluginConfig,
    name: string,
    installPath?: string
  ) {
    super(config, name, installPath);

    if (!this.config.namespace) {
      throw new Error(
        `The \`namespace\` configuration parameter was not provided to the ${this.name} plugin.`
      );
    }
  }

  public override addHooks(hooks: EngineHooks) {
    super.addHooks(hooks);

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
          `${this.name.replace(/^storage-/, "")}-${this.config.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}.ts`
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
      const name = `${camelCase(`${this.name.replace(/^storage-/, "")}-${this.config.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}`)}Storage`;
      context.runtime.storage.push({
        name,
        namespace: this.config.namespace,
        import: `import ${name} from "./${joinPaths("storage", `${this.name.replace(/^storage-/, "")}-${this.config.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}`)}"; `
      });
    }
  }
}
