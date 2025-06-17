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

import defu from "defu";
import type { BuildOptions } from "esbuild";
import { build as esbuild } from "esbuild";
import type { CompileOptions, Context, Options } from "../../types/build";
import { compilerPlugin } from "./compiler-plugin";
import { externalPlugin } from "./external-plugin";

export type BundleOptions<TOptions extends Options = Options> = CompileOptions &
  Pick<TOptions, "external" | "noExternal" | "skipNodeModulesBundle">;

export async function bundle<TOptions extends Options = Options>(
  context: Context<TOptions>,
  entryPoint: string,
  outputDir: string,
  override: Partial<BuildOptions> = {},
  options: BundleOptions<TOptions> = {}
) {
  const contextOverrides = { ...context.override };
  delete contextOverrides.external;
  delete contextOverrides.noExternal;
  delete contextOverrides.skipNodeModulesBundle;

  const esbuildOptions = defu(override ?? {}, contextOverrides, {
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
        {
          external: options.external ?? context.options.external,
          noExternal: options.noExternal ?? context.options.noExternal,
          skipNodeModulesBundle: options.skipNodeModulesBundle ?? true
        },
        context.tsconfig.options?.paths
      ),
      compilerPlugin(context, options)
    ]
  }) as BuildOptions;

  return esbuild(esbuildOptions);
}
