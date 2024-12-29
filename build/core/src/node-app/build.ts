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

import { build as esbuild } from "@storm-software/esbuild";
import stormStack from "@storm-stack/build-plugin/esbuild";

/**
 * Build a NodeJs application
 *
 * @param projectRoot - The project root
 * @param entry - The entry point(s) of the project
 */
export const build = async (
  projectRoot: string,
  entry:
    | string
    | string[]
    | Record<string, string>
    | {
        in: string;
        out: string;
      }[] = ["src/index.ts"]
) => {
  const entryPoints = typeof entry === "string" ? [entry] : entry;

  await esbuild([
    {
      entryPoints,
      projectRoot,
      outdir: "dist",
      platform: "node",
      format: "cjs",
      bundle: true,
      minify: true,
      sourcemap: true,
      plugins: [
        stormStack({
          cache: true
        })
      ]
    },
    {
      entryPoints,
      projectRoot,
      outdir: "dist",
      platform: "node",
      format: "esm",
      bundle: true,
      minify: true,
      sourcemap: true,
      plugins: [
        stormStack({
          cache: true
        })
      ]
    }
  ]);
};
