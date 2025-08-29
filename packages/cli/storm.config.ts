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

export default defineConfig({
  name: "Storm Stack",
  skipCache: true,
  mode: "development",
  plugins: [
    [
      "@storm-stack/plugin-cli",
      {
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
      }
    ],
    [
      "@storm-stack/plugin-log-storage",
      {
        logLevel: "info"
      }
    ],
    [
      "@storm-stack/plugin-log-sentry",
      {
        logLevel: "error"
      }
    ]
  ],
  external: ["@storm-stack/core"],
  esbuild: {
    format: "esm"
  },
  output: {
    outputMode: "fs"
  }
});
