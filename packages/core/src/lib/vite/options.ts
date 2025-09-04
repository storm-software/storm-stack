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

import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";
import { ViteOptions } from "../../types/config";
import { Context } from "../../types/context";
import { resolveESBuildOptions } from "../esbuild/options";

/**
 * Resolves the options for [vite](https://vitejs.dev/).
 *
 * @param context - The build context.
 * @param override - The user-defined options.
 * @returns The resolved options.
 */
export function resolveViteOptions<TContext extends Context = Context>(
  context: TContext,
  override: Partial<ViteOptions> = {}
): ViteOptions {
  return defu(
    {
      resolve: {
        alias: context.vfs.runtimeIdMap.keys().reduce(
          (ret, id) => {
            const path = context.vfs.runtimeIdMap.get(id);
            if (path) {
              ret[id] = path;
            }

            return ret;
          },
          {} as Record<string, string>
        )
      }
    },
    override,
    context.options.variant === "vite" ? context.options.override : {},
    {
      external: context.options.external,
      noExternal: context.options.noExternal,
      skipNodeModulesBundle: context.options.skipNodeModulesBundle
    },
    {
      rootDir: context.options.sourceRoot,
      mode:
        context.options.mode === "development" ? "development" : "production",
      cacheDir: joinPaths(context.cachePath, "vite"),
      build: {
        minify: context.options.mode !== "development",
        metafile: context.options.mode === "development",
        sourcemap: context.options.mode === "development",
        outDir: context.options.output.outputPath,
        tsconfig: context.tsconfig.tsconfigFilePath,
        tsconfigRaw: context.tsconfig.tsconfigJson
      },
      esbuild: resolveESBuildOptions(context),
      assetsInclude: context.options.output.assets,
      logLevel: context.options.logLevel,
      envDir: context.options.projectRoot,
      noExternal: Array.from(context.vfs.runtimeIdMap.keys())
    } as ViteOptions,
    context.options.variant === "vite" ? context.options.build : {},
    {
      resolve: {
        extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"]
      },
      json: {
        stringify: true
      },
      logLevel: "silent",
      clearScreen: true
    }
  ) as ViteOptions;
}
