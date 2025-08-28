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

import { build } from "@storm-software/esbuild/build";
import type { ESBuildOptions as BaseESBuildOptions } from "@storm-software/esbuild/types";
import { findFileExtension } from "@stryke/path/file-path-fns";
import { replacePath } from "@stryke/path/replace";
import { isFunction } from "@stryke/type-checks/is-function";
import defu from "defu";
import { BuildOptions } from "esbuild";
import { Format } from "tsup";
import { ESBuildOverrideOptions } from "../../types/config";
import { Context } from "../../types/context";
import { compilerPlugin } from "./compiler-plugin";
import { resolverPlugin } from "./resolver-plugin";

/**
 * Build the project using esbuild
 *
 * @param context - The context of the build
 * @param override - The override options for the build
 */
export async function esbuild(
  context: Context,
  override: Partial<ESBuildOverrideOptions> = {}
) {
  const options = defu(
    override ?? {},
    context.options.esbuild.override,
    {
      entry: context.entry.reduce(
        (ret, entry) => {
          ret[
            entry.output ||
              replacePath(
                entry.input.file,
                context.projectJson?.sourceRoot || context.options.projectRoot
              ).replace(findFileExtension(entry.input.file) || "", "") ||
              replacePath(
                entry.file,
                context.projectJson?.sourceRoot || context.options.projectRoot
              ).replace(findFileExtension(entry.file) || "", "")
          ] = entry.file;

          return ret;
        },
        {} as Record<string, string>
      ),
      assets: context.options.output.assets,
      outputPath: context.options.output.outputPath,
      mode: context.options.mode,
      platform: context.options.platform,
      projectRoot: context.options.projectRoot,
      sourceRoot: context.options.sourceRoot,
      tsconfig: context.tsconfig.tsconfigFilePath,
      tsconfigRaw: context.tsconfig.tsconfigJson,
      external: context.options.external,
      noExternal: context.options.noExternal,
      skipNodeModulesBundle: context.options.skipNodeModulesBundle
    },
    context.options.esbuild,
    {
      banner: {
        js:
          context.options.mode !== "production"
            ? "\n//  ⚡  Built with Storm Stack \n"
            : " "
      },
      minify: context.options.mode !== "development",
      metafile: context.options.mode === "development",
      sourcemap: context.options.mode === "development",
      dts: context.options.projectType !== "application",
      noExternal: Array.from(context.vfs.runtimeIdMap.keys())
    }
  ) as BaseESBuildOptions;

  await build(
    defu(
      {
        config: false,
        clean: true,
        esbuildOptions(
          opts: BuildOptions,
          ctx: {
            format: Format;
          }
        ) {
          if (isFunction(options.esbuildOptions)) {
            options.esbuildOptions(opts, ctx);
          }

          opts.alias = defu(
            opts.alias ?? {},
            Object.fromEntries(context.vfs.runtimeIdMap.entries())
          );
        },
        esbuildPlugins: [
          resolverPlugin(context, {
            external: options.external,
            noExternal: options.noExternal,
            skipNodeModulesBundle: options.skipNodeModulesBundle
          }),
          compilerPlugin(context)
        ]
      },
      options
    )
  );
}
