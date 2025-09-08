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

import StormStackCLIPlugin from "@storm-stack/plugin-cli/plugin";
import StormStackLogSentryPlugin from "@storm-stack/plugin-log-sentry/plugin";
import StormStackLogStoragePlugin from "@storm-stack/plugin-log-storage/plugin";
import { defineConfig } from "../core/src/define-config";

export default defineConfig({
  name: "Storm Stack",
  skipCache: true,
  plugins: [
    new StormStackCLIPlugin({
      title: {
        text: "Storm Stack",
        font: "tiny",
        colors: ["cyan"],
        gradient: false
      },
      bin: ["storm", "storm-stack"],
      config: {
        types: "./src/types.ts#StormStackCLIConfig"
      }
    }),
    new StormStackLogStoragePlugin({
      logLevel: "info"
    }),
    new StormStackLogSentryPlugin({
      logLevel: "error"
    })
  ],
  external: ["@storm-stack/core"],
  output: {
    outputMode: "fs"
  }
});
