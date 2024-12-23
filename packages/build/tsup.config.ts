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
  name: "build",
  target: "node22",
  entryPoints: ["./src/node/app.ts"],
  format: ["cjs"],
  bundle: true,
  splitting: true,
  clean: true,
  sourcemap: false,
  tsconfig: "./tsconfig.json",
  external: ["nx", "@nx/*", "@swc/*", "typia"],
  dts: {
    resolve: true,
    // build types for `src/index.ts` only
    entry: "./src/index.ts"
  }
});
