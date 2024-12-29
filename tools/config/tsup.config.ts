/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { defineConfig } from "tsup";

export default defineConfig({
  name: "tools-config",
  entryPoints: ["src/*.ts"],
  external: ["tsup"],
  target: "node22",
  format: ["cjs", "esm"],
  bundle: true,
  splitting: true,
  clean: true,
  sourcemap: false,
  tsconfig: "./tsconfig.json",
  dts: {
    resolve: true
  }
});