/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { getTsupConfig } from "@storm-stack/tools-config/tsup.shared";
import type { Options } from "tsup";

const config: Options = getTsupConfig({
  name: "plugin-cloudflare",
  entry: ["src/*.ts"],
  outDir: "dist",
  bundle: false,
  splitting: false,
  treeshake: true,
  keepNames: true,
  clean: true,
  sourcemap: false,
  dts: true,
  shims: false
});

export default config;
