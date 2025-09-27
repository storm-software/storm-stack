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

import { findFileExtensionSafe } from "@stryke/path/file-path-fns";
import { replacePath } from "@stryke/path/replace";
import { isString } from "@stryke/type-checks/is-string";
import defu from "defu";
import type { ResolvedEntryTypeDefinition } from "../../types/build";
import { ESBuildConfig, ESBuildOptions, TsupConfig } from "../../types/config";
import { Context } from "../../types/context";
import { resolveEntryInputFile, resolveEntryOutput } from "../entry";
import { BundleOptions } from "./build";

/**
 * Resolves the entry options for esbuild.
 *
 * @param context - The build context.
 * @param entryPoints - The entry points to resolve.
 * @returns The resolved entry options.
 */
export function resolveEsbuildEntryOptions(
  context: Context,
  entryPoints: ResolvedEntryTypeDefinition[] | string[] = []
): ESBuildOptions["entryPoints"] {
  return entryPoints.reduce(
    (ret, entry) => {
      if (isString(entry)) {
        ret[
          replacePath(
            entry,
            context.options.sourceRoot || context.options.projectRoot
          ).replace(`.${findFileExtensionSafe(entry)}`, "")
        ] = replacePath(
          entry,
          context.options.sourceRoot || context.options.projectRoot
        );
      } else {
        ret[entry.output || resolveEntryOutput(context, entry.input || entry)] =
          resolveEntryInputFile(context, entry.input || entry);
      }

      return ret;
    },
    {} as Record<string, string>
  );
}

/**
 * Resolves the esbuild options.
 *
 * @param context - The build context.
 * @param options - The user-defined options.
 * @param bundleOptions - The bundle options.
 * @returns The resolved esbuild options.
 */
export function resolveESBuildOptions(
  context: Context,
  options: Partial<ESBuildOptions> = {},
  bundleOptions: BundleOptions = {}
): ESBuildOptions {
  return defu(
    {
      alias: bundleOptions.alias,
      sourcemap: false
    },
    {
      alias: context.vfs.builtinIdMap.keys().reduce(
        (ret, id) => {
          const path = context.vfs.builtinIdMap.get(id);
          if (path) {
            ret[id] = path;
          }

          return ret;
        },
        {} as Record<string, string>
      )
    },
    bundleOptions.override ?? {},
    context.options.variant === "esbuild" ? context.options.override : {},
    {
      platform: context.options.platform,
      format: options?.format,
      target: options?.target,
      globalName: options?.globalName,
      minify: context.options.mode !== "development",
      metafile: context.options.mode === "development",
      sourcemap: context.options.mode === "development",
      bundle: options?.bundle,
      treeShaking:
        Boolean((context.options.build as TsupConfig)?.treeshake) ||
        (context.options.build as ESBuildConfig)?.treeShaking,
      keepNames: options?.keepNames,
      splitting: options?.splitting,
      outdir: context.options.output.outputPath,
      tsconfig: context.tsconfig.tsconfigFilePath,
      banner: options?.banner,
      footer: options?.footer,
      plugins: options?.plugins
    },
    context.options.variant === "esbuild" ? context.options.build : {},
    {
      platform: "neutral",
      format: "esm",
      minify: true,
      sourcemap: false,
      bundle: true,
      treeShaking: true,
      keepNames: true,
      splitting: true,
      logLevel: "silent"
    }
  ) as ESBuildOptions;
}
