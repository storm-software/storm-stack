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
      "src/index.ts",
      "src/define-config.ts",
      "src/base/*.ts",
      "src/base/vfs/*.ts",
      "src/types/*.ts",
      "src/commands/*/index.ts",
      "src/unplugin/*.ts"
    ],
    outDir: "dist",
    clean: false,
    sourcemap: true,
    noExternal: ["memfs", "@deepkit/type-compiler"],
    skipNodeModulesBundle: true
  },
  {
    name: "core-lib",
    entry: [
      "src/lib/*.ts",
      "src/lib/babel/*.ts",
      "src/lib/deepkit/*.ts",
      "src/lib/esbuild/*.ts",
      "src/lib/tsup/*.ts",
      "src/lib/typedoc/*.ts",
      "src/lib/typedoc/helpers/*.ts",
      "src/lib/typescript/*.ts",
      "src/lib/unbuild/*.ts",
      "src/lib/unplugin/*.ts",
      "src/lib/vite/*.ts",
      "src/lib/utilities/*.ts"
    ],
    outDir: "dist/lib",
    clean: false,
    noExternal: ["@deepkit/type-compiler"],
    skipNodeModulesBundle: true
  },
  {
    name: "core-deepkit",
    entry: ["src/deepkit/*.ts"],
    outDir: "dist/deepkit",
    platform: "neutral",
    target: "esnext",
    clean: false,
    noExternal: ["@deepkit/core", "@deepkit/type", "@deepkit/type-spec"]
  }
]);

export default config;
