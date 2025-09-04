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

import { Entry } from "@storm-software/build-tools/types";
import defu from "defu";
import type { ResolvedEntryTypeDefinition } from "../../types/build";
import { ESBuildConfig, TsupConfig, TsupOptions } from "../../types/config";
import { Context } from "../../types/context";
import { resolveEsbuildEntryOptions } from "../esbuild/options";

/**
 * Resolves the entry options for [tsup](https://github.com/egoist/tsup).
 *
 * @param context - The build context.
 * @param entryPoints - The entry points to resolve.
 * @returns The resolved entry options.
 */
export function resolveTsupEntryOptions(
  context: Context,
  entryPoints: ResolvedEntryTypeDefinition[] | string[]
): Entry {
  return resolveEsbuildEntryOptions(context, entryPoints) as Entry;
}

/**
 * Resolves the options for [tsup](https://github.com/egoist/tsup).
 *
 * @param context - The build context.
 * @param override - The user-defined options.
 * @returns The resolved options.
 */
export function resolveTsupOptions(
  context: Context,
  override: Partial<TsupOptions> = {}
): TsupOptions {
  return defu(
    {
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
    },
    override,
    context.options.variant === "tsup" ||
      (context.options.variant === "standalone" &&
        context.options.projectType === "application")
      ? context.options.override
      : {},
    {
      external: context.options.external,
      noExternal: context.options.noExternal,
      skipNodeModulesBundle: context.options.skipNodeModulesBundle
    },
    {
      globalName: override.globalName,
      minify: context.options.mode !== "development",
      metafile: context.options.mode === "development",
      sourcemap: context.options.mode === "development",
      dts: context.options.projectType !== "application",
      bundle: override?.bundle,
      treeshake:
        (context.options.build as TsupConfig)?.treeshake ||
        (context.options.build as ESBuildConfig)?.treeShaking,
      assets: context.options.output.assets,
      outputPath: context.options.output.outputPath,
      mode: context.options.mode,
      platform: context.options.platform,
      projectRoot: context.options.projectRoot,
      sourceRoot: context.options.sourceRoot,
      outdir: context.options.output.outputPath,
      tsconfig: context.tsconfig.tsconfigFilePath,
      tsconfigRaw: context.tsconfig.tsconfigJson,
      noExternal: Array.from(context.vfs.runtimeIdMap.keys())
    },
    context.options.variant === "tsup" ||
      (context.options.variant === "standalone" &&
        context.options.projectType === "application")
      ? context.options.build
      : {},
    {
      banner: {
        js:
          context.options.mode !== "production"
            ? "\n//  ⚡  Built with Storm Stack \n"
            : " "
      },
      platform: "neutral",
      format: "esm",
      minify: true,
      sourcemap: false,
      bundle: true,
      treeshake: true,
      keepNames: true,
      splitting: true,
      logLevel: "silent"
    }
  ) as TsupOptions;
}
