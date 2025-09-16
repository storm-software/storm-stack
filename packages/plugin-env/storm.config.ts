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

import { defineConfig } from "@storm-stack/core/define-config";
import StormStackPluginPlugin from "@storm-stack/devkit/plugins/plugin";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/plugin.ts",
    "src/templates/*.ts",
    "src/types/*.ts",
    "src/helpers/*.ts",
    "src/babel/*.ts"
  ],
  plugins: [
    new StormStackPluginPlugin({
      // render: {
      //   templates: "src/templates"
      // }
    })
  ],
  output: {
    outputMode: "fs"
  }
});
