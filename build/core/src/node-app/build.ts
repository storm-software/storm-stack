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

import { build as esbuild, type ESBuildOptions } from "@storm-software/esbuild";
import stormStack from "@storm-stack/build-plugin/esbuild";
import { EntryPointsOption } from "../types";

/**
 * The options for building a NodeJs application
 */
export interface NodeAppBuildOptions {
  /**
   * The entry point(s) of the project
   *
   * @defaultValue ["src/index.ts"]
   */
  entryPoints?: EntryPointsOption;

  /**
   * Should the build be run in development mode
   *
   * @remarks
   * When set to `true`, the build will not be minified and will include sourcemaps
   *
   * @defaultValue false
   */
  debug?: boolean;

  /**
   * A list of files to include in the build package
   *
   * @defaultValue []
   */
  assets?: ESBuildOptions["assets"];

  /**
   * The output path of the build
   *
   * @remarks
   * The path is relative to the distribution/build directory. In most cases, you should not need to change this.
   *
   * @defaultValue "dist"
   */
  outputPath?: string;
}

/**
 * Build a NodeJs application
 *
 * @param projectRoot - The project root
 * @param entry - The entry point(s) of the project
 */
export const build = (
  projectRoot: string,
  options: NodeAppBuildOptions = {}
) => {
  const entryPoints = !options.entryPoints
    ? ["src/index.ts"]
    : typeof options.entryPoints === "string"
      ? [options.entryPoints]
      : options.entryPoints;

  return esbuild([
    {
      entryPoints,
      projectRoot,
      outdir: options.outputPath || "dist",
      platform: "node",
      format: "cjs",
      bundle: true,
      generatePackageJson: true,
      minify: !options.debug,
      sourcemap: options.debug,
      plugins: [
        stormStack({
          cache: true
        })
      ]
    },
    {
      entryPoints,
      projectRoot,
      outdir: options.outputPath || "dist",
      platform: "node",
      format: "esm",
      bundle: true,
      generatePackageJson: true,
      minify: !options.debug,
      sourcemap: options.debug,
      plugins: [
        stormStack({
          cache: true
        })
      ]
    }
  ]);
};
