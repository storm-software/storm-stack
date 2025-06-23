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
import type { Context, EngineHooks } from "@storm-stack/core/types/build";
import { unbuild } from "../helpers/unbuild";
import BasePlugin from "./base";

export default class LibraryPlugin extends BasePlugin {
  public constructor(
    protected config: any = {},
    name = "library-plugin",
    installPath = "@storm-stack/devkit/plugins/library"
  ) {
    super(name, installPath);
  }

  public override addHooks(hooks: EngineHooks) {
    super.addHooks(hooks);

    hooks.addHooks({
      "build:library": this.build.bind(this)
    });
  }

  private async build(context: Context) {
    this.log(LogLevelLabel.TRACE, `Build the Storm Stack library package.`);

    return unbuild(context);
  }
}
