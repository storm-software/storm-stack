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

import { getTsupConfig } from "@storm-stack/tools-config/tsup.shared";

const config = getTsupConfig({
  name: "plugin-cloudflare-worker",
  entry: ["src/index.ts"],
  outDir: "dist",
  bundle: true,
  splitting: false,
  treeshake: true,
  keepNames: true,
  clean: true,
  sourcemap: true,
  dts: true,
  shims: true,
  skipNodeModulesBundle: true
});

export default config;
