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

import { ESBuildOverrideOptions } from "@storm-stack/core/types/config";
import { findFileExtension } from "@stryke/path/file-path-fns";
import { replacePath } from "@stryke/path/replace";
import defu from "defu";
import { BuildOptions as ExternalESBuildOptions } from "esbuild";
import type { Context, ResolvedEntryTypeDefinition } from "../../types/build";
import { BundleOptions } from "./bundle";
import { compilerPlugin } from "./compiler-plugin";
import { externalPlugin } from "./external-plugin";

export function resolveEsbuildEntryOptions(
  context: Context,
  entryPoints: ResolvedEntryTypeDefinition[]
): ExternalESBuildOptions["entryPoints"] {
  return entryPoints.reduce(
    (ret, entry) => {
      ret[
        entry.output ||
          replacePath(
            entry.input.file,
            context.projectJson?.sourceRoot || context.options.projectRoot
          ).replace(findFileExtension(entry.input.file), "") ||
          replacePath(
            entry.file,
            context.projectJson?.sourceRoot || context.options.projectRoot
          ).replace(findFileExtension(entry.file), "")
      ] = entry.file;

      return ret;
    },
    {} as Record<string, string>
  );
}

export async function resolveExternalESBuildOptions(
  context: Context,
  override: Partial<ESBuildOverrideOptions> = {},
  bundleOptions: BundleOptions = {}
): Promise<ExternalESBuildOptions> {
  const result = defu(
    {
      plugins: [
        // vfsPlugin(context),
        externalPlugin(
          {
            external: bundleOptions.external ?? context.options.external,
            noExternal: bundleOptions.noExternal ?? context.options.noExternal,
            skipNodeModulesBundle:
              bundleOptions.skipNodeModulesBundle ??
              context.options.skipNodeModulesBundle
          },
          context.tsconfig.options?.paths
        ),
        compilerPlugin(context, bundleOptions)
      ].filter(Boolean)
    },
    override ?? {},
    context.options.esbuild.override ?? {},
    {
      platform: context.options.platform,
      alias: context.options.alias,
      format: context.options.esbuild.format,
      target: context.options.esbuild.target,
      globalName: context.options.esbuild.globalName,
      minify: context.options.mode !== "development",
      metafile: context.options.mode === "development",
      sourcemap: context.options.mode === "development",
      sourceRoot: context.options.esbuild.sourceRoot,
      bundle: context.options.esbuild.bundle,
      treeShaking: context.options.esbuild.treeshake,
      keepNames: context.options.esbuild.keepNames,
      splitting: context.options.esbuild.splitting,
      outdir: context.options.outputPath,
      tsconfig: context.options.tsconfig,
      tsconfigRaw: context.options.tsconfigRaw,
      banner: context.options.esbuild.banner,
      footer: context.options.esbuild.footer,
      plugins: context.options.esbuild.plugins
    },
    {
      platform: "neutral",
      format: "esm",
      minify: false,
      sourcemap: false,
      bundle: true,
      treeShaking: true,
      keepNames: true,
      splitting: false,
      logLevel: "silent"
    }
  ) as ExternalESBuildOptions;

  return result;
}
