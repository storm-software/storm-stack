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

import type { Options } from "tsup";
import { defineConfig } from "tsup";

export type TsupOptions = Partial<Options> &
  Pick<Options, "name" | "entryPoints">;

const defaultOptions: TsupOptions = {
  target: "node22",
  outDir: "dist",
  format: ["cjs", "esm"],
  bundle: true,
  splitting: true,
  treeshake: true,
  keepNames: true,
  clean: true,
  sourcemap: false,
  platform: "node",
  tsconfig: "./tsconfig.json",
  dts: true,
  shims: true
};

export function defineTsupConfig(options: TsupOptions | TsupOptions[]) {
  return Array.isArray(options)
    ? defineConfig(
        options.map(option => ({
          ...defaultOptions,
          onSuccess: async () => {
            // eslint-disable-next-line no-console
            console.log(`✅ ${option.name} build completed successfully!`);
          },
          ...option
        }))
      )
    : defineConfig({
        ...defaultOptions,
        onSuccess: async () => {
          // eslint-disable-next-line no-console
          console.log(`✅ ${options.name} build completed successfully!`);
        },
        ...options
      });
}
