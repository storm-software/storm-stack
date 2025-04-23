/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import { noop } from "@stryke/helpers/noop";
import { findFilePath, relativePath } from "@stryke/path/file-path-fns";
import defu from "defu";
import type { BuildOptions } from "esbuild";
import { build as esbuild } from "esbuild";
import type { CompileOptions, Context, Options } from "../../types/build";
import { compilerPlugin } from "./compiler-plugin";
import { externalPlugin } from "./external-plugin";

export async function bundle<TOptions extends Options = Options>(
  context: Context<TOptions>,
  entryPoint: string,
  outputDir: string,
  override: Partial<BuildOptions> = {},
  options?: CompileOptions
) {
  const esbuildOptions = defu(override ?? {}, context.override, {
    entryPoints: [entryPoint],
    platform: "node",
    format: "esm",
    minify: false,
    sourcemap: false,
    bundle: true,
    treeShaking: true,
    keepNames: true,
    splitting: false,
    preserveSymlinks: true,
    outdir: outputDir,
    logLevel: "silent",
    plugins: [
      externalPlugin(
        noop,
        {
          external: context.external,
          noExternal: context.noExternal,
          skipNodeModulesBundle: true
        },
        context.resolvedTsconfig.tsconfigJson.compilerOptions?.paths
      ),
      compilerPlugin(noop, context, options)
    ]
  }) as BuildOptions;

  esbuildOptions.alias = Object.entries(esbuildOptions.alias ?? {}).reduce(
    (ret, [key, value]) => {
      ret[key] = relativePath(findFilePath(entryPoint), value);

      return ret;
    },
    {} as Record<string, string>
  );

  return esbuild(esbuildOptions);
}
