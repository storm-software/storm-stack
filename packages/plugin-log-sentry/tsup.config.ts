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

import { getTsupConfig } from "@storm-stack/tools-config/tsup.shared";
import { Options } from "tsup";

const config: Options = getTsupConfig({
  name: "plugin-log-sentry",
  entry: ["src/index.ts", "src/types.ts"],
  outDir: "dist",
  bundle: true,
  splitting: true,
  treeshake: true,
  keepNames: true,
  clean: true,
  sourcemap: false,
  dts: true,
  shims: true
});

export default config;
