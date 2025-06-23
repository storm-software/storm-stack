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
import { Plugin } from "@storm-stack/core/plugin";
import type { Context, EngineHooks } from "@storm-stack/core/types/build";

export default class BasePlugin extends Plugin {
  /**
   * A list of dependencies that are required for the plugin to work. These dependencies will be installed when Storm Stack CLI is run.
   */
  protected installs: Record<string, "dependency" | "devDependency">;

  public constructor(name: string, installPath?: string) {
    super(name, installPath);
    this.installs = {};
  }

  public addHooks(hooks: EngineHooks) {
    hooks.addHooks({
      "init:context": this.#initContext.bind(this)
    });
  }

  async #initContext(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Adding required installations for the project.`
    );

    if (Object.keys(this.installs).length > 0) {
      Object.keys(this.installs).forEach(dependency => {
        if (
          this.installs[dependency] &&
          (this.installs[dependency] === "devDependency" ||
            context.options.projectType === "application")
        ) {
          if (
            dependency.lastIndexOf("@") > 0 &&
            dependency.substring(0, dependency.lastIndexOf("@")) in
              context.installs
          ) {
            // Remove the existing dependency if it does not include the version
            // This is a workaround for the fact that we cannot install the same package with different versions
            delete context.installs[
              dependency.substring(0, dependency.lastIndexOf("@"))
            ];
          }

          context.installs[dependency] = this.installs[dependency];
        }
      });
    }
  }
}
