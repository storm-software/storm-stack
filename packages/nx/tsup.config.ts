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

import { getTsupConfig } from "@storm-stack/tools-config/tsup.shared";

const config = getTsupConfig({
  name: "nx",
  entry: [
    "./index.ts",
    "./executors.ts",
    "./src/plugin/index.ts",
    "./src/executors/*/executor.ts",
    "./src/executors/*/untyped.ts"
  ],
  outDir: "dist",
  format: ["cjs", "esm"],
  platform: "node",
  bundle: true,
  splitting: true,
  dts: true,
  shims: true,
  clean: false,
  skipNodeModulesBundle: true
});

export default config;
