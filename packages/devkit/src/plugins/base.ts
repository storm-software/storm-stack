/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/plugin";
import type {
  Context,
  EngineHooks,
  Options
} from "@storm-stack/core/types/build";

export default class BasePlugin<
  TOptions extends Options = Options
> extends Plugin<TOptions> {
  /**
   * A list of dependencies that are required for the plugin to work. These dependencies will be installed when Storm Stack CLI is run.
   */
  protected dependencies: string[] = [];

  /**
   * A list of devDependencies that are required for the plugin to work. These dependencies will be installed when Storm Stack CLI is run.
   */
  protected devDependencies: string[] = [];

  public constructor(name: string, installPath?: string) {
    super(name, installPath);
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.#initContext.bind(this)
    });
  }

  async #initContext(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Adding required installations for the project.`
    );

    const promises = [] as Promise<void>[];
    if (
      this.dependencies.length > 0 &&
      context.options.projectType === "application"
    ) {
      this.dependencies.forEach(dependency => {
        context.installs[dependency] = "dependency";
      });
    }

    if (this.devDependencies.length > 0) {
      this.devDependencies.forEach(dependency => {
        context.installs[dependency] = "devDependency";
      });
    }

    await Promise.all(promises);
  }
}
