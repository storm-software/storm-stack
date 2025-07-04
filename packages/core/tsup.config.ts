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

const config = getTsupConfig([
  {
    name: "core",
    entry: [
      "src/index.ts",
      "src/base/*.ts",
      "src/types/*.ts",
      "src/helpers/*.ts",
      "src/unplugin/*.ts",
      "src/init/index.ts",
      "src/new/index.ts",
      "src/clean/index.ts",
      "src/prepare/index.ts",
      "src/prepare/runtime/runtime/shared/*.ts",
      "src/prepare/runtime/runtime/node/*.ts",
      "src/lint/index.ts",
      "src/build/index.ts",
      "src/docs/index.ts",
      "src/finalize/index.ts",
      "src/helpers/utilities/*.ts",
      "src/helpers/esbuild/*.ts",
      "src/helpers/unbuild/*.ts",
      "src/helpers/dts/*.ts",
      "src/helpers/dotenv/*.ts",
      "src/helpers/deepkit/*.ts",
      "src/helpers/typedoc/*.ts",
      "src/helpers/typescript/*.ts",
      "src/helpers/transform/*.ts"
    ],
    outDir: "dist/build",
    bundle: true,
    splitting: true,
    treeshake: true,
    keepNames: true,
    clean: true,
    sourcemap: true,
    dts: true,
    shims: false,
    external: ["typescript"]
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
  },
  {
    name: "core-workers",
    entry: ["src/init/workers/workers/*.ts"],
    outDir: "dist/workers",
    format: ["cjs"],
    platform: "node",
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
