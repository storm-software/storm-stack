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
import CLIPlugin from "@storm-stack/plugin-cli/plugin";
import LogSentryPlugin from "@storm-stack/plugin-log-sentry/plugin";
import LogStoragePlugin from "@storm-stack/plugin-log-storage/plugin";

export default defineConfig({
  name: "Storm Stack",
  skipCache: true,
  plugins: [
    new CLIPlugin({
      title: {
        font: "tiny",
        colors: ["cyan"],
        gradient: false
      },
      bin: ["storm", "storm-stack"],
      env: {
        types: "./src/types/env.ts#StormStackCLIEnv"
      }
    }),
    new LogStoragePlugin({
      logLevel: "info"
    }),
    new LogSentryPlugin({
      logLevel: "error"
    })
  ],
  external: ["@storm-stack/core"]
});
