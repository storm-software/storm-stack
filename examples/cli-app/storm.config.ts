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
import DatePlugin from "@storm-stack/plugin-date/plugin";
import LogSentryPlugin from "@storm-stack/plugin-log-sentry/plugin";

export default defineConfig({
  name: "Example CLI",
  skipCache: true,
  plugins: [
    new CLIPlugin({
      bin: "examples-cli",
      env: {
        types: "./src/types.ts#StormCLIAppEnv"
      }
    }),
    new DatePlugin({
      type: "date-fns"
    }),
    new LogSentryPlugin({
      logLevel: "error"
    })
  ],
  output: {
    outputMode: "fs"
  }
});
