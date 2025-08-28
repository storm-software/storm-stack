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

const config = getTsupConfig([
  {
    name: "core",
    entry: [
      "src/*.ts",
      "src/base/*.ts",
      "src/types/*.ts",
      "src/lib/*.ts",
      "src/lib/babel/*.ts",
      "src/lib/deepkit/*.ts",
      "src/lib/esbuild/*.ts",
      "src/lib/typedoc/*.ts",
      "src/lib/typescript/*.ts",
      "src/lib/unbuild/*.ts",
      "src/lib/utilities/*.ts",
      "src/lib/vfs/*.ts",
      "src/commands/*/index.ts",
      "src/unplugin/*.ts"
    ],
    outDir: "dist",
    bundle: true,
    splitting: true,
    treeshake: true,
    keepNames: true,
    clean: true,
    sourcemap: true,
    dts: true,
    shims: true,
    noExternal: [
      "memfs",
      "@deepkit/core",
      "@deepkit/type-spec",
      "@deepkit/type-compiler",
      "@deepkit/type"
    ],
    skipNodeModulesBundle: true
  },
  {
    name: "core-schemas",
    entry: ["schemas/*.ts"],
    outDir: "dist/schemas",
    bundle: true,
    splitting: true,
    treeshake: true,
    keepNames: true,
    clean: true,
    sourcemap: true,
    dts: true,
    shims: true
  }
]);

export default config;
