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

import { defineTsupConfig } from "@storm-stack/tools-config/tsup.shared";

const config = defineTsupConfig([
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
    external: [
      "@storm-stack/core/deepkit/core",
      "@storm-stack/core/deepkit/type-compiler",
      "@storm-stack/core/deepkit/type-spec",
      "@storm-stack/core/deepkit/type"
    ],
    noExternal: ["memfs"],
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
    skipNodeModulesBundle: true,
    external: [
      "@storm-stack/core/deepkit/core",
      "@storm-stack/core/deepkit/type-compiler",
      "@storm-stack/core/deepkit/type-spec",
      "@storm-stack/core/deepkit/type"
    ]
  },
  {
    name: "core-deepkit-libs",
    entry: [
      "src/deepkit/type.ts",
      "src/deepkit/type-spec.ts",
      "src/deepkit/core.ts"
    ],
    outDir: "dist/deepkit",
    platform: "neutral",
    target: "esnext",
    clean: false,
    noExternal: ["@deepkit/core", "@deepkit/type", "@deepkit/type-spec"]
  },
  {
    name: "core-deepkit-compiler",
    entry: ["src/deepkit/type-compiler.ts"],
    outDir: "dist/deepkit",
    platform: "node",
    target: "esnext",
    clean: false,
    noExternal: ["@deepkit/type-compiler"]
  },
  {
    name: "core-bin",
    entry: ["scripts/post-install.ts"],
    outDir: "bin",
    platform: "node",
    target: "node22",
    clean: true,
    noExternal: ["@storm-stack/core/deepkit/type-compiler"]
  }
]);

export default config;
