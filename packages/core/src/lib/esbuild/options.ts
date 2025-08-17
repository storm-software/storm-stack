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

import { findFileExtension } from "@stryke/path/file-path-fns";
import { replacePath } from "@stryke/path/replace";
import { isString } from "@stryke/type-checks/is-string";
import defu from "defu";
import { BuildOptions as ExternalESBuildOptions } from "esbuild";
import { BundleOptions } from ".";
import type { ResolvedEntryTypeDefinition } from "../../types/build";
import { ESBuildOverrideOptions } from "../../types/config";
import { Context } from "../../types/context";

export function resolveEsbuildEntryOptions(
  context: Context,
  entryPoints: ResolvedEntryTypeDefinition[] | string[]
): ExternalESBuildOptions["entryPoints"] {
  return entryPoints.reduce(
    (ret, entry) => {
      if (isString(entry)) {
        ret[
          replacePath(entry, context.options.workspaceRoot).replace(
            findFileExtension(entry) || "",
            ""
          )
        ] = replacePath(entry, context.options.workspaceRoot);
      } else {
        ret[
          entry.output ||
            replacePath(
              entry.input.file,
              context.options.workspaceRoot
            ).replace(findFileExtension(entry.input.file) || "", "") ||
            replacePath(entry.file, context.options.workspaceRoot).replace(
              findFileExtension(entry.file) || "",
              ""
            )
        ] = replacePath(entry.file, context.options.workspaceRoot);
      }

      return ret;
    },
    {} as Record<string, string>
  );
}

export function resolveESBuildOptions(
  context: Context,
  override: Partial<ESBuildOverrideOptions> = {},
  bundleOptions: BundleOptions = {}
): ExternalESBuildOptions {
  const result = defu(
    override ?? {},
    {
      alias: bundleOptions.alias,
      sourcemap: false
    },
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
    bundleOptions.override ?? {},
    context.options.esbuild.override ?? {},
    {
      platform: context.options.platform,
      format: context.options.esbuild.format,
      target: context.options.esbuild.target,
      globalName: context.options.esbuild.globalName,
      minify: context.options.mode !== "development",
      metafile: context.options.mode === "development",
      sourcemap: context.options.mode === "development",
      bundle: context.options.esbuild.bundle,
      treeShaking: context.options.esbuild.treeshake,
      keepNames: context.options.esbuild.keepNames,
      splitting: context.options.esbuild.splitting,
      outdir: context.options.output.outputPath,
      tsconfig: context.tsconfig.tsconfigFilePath,
      banner: context.options.esbuild.banner,
      footer: context.options.esbuild.footer,
      plugins: context.options.esbuild.plugins
    },
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
  ) as ExternalESBuildOptions;

  return result;
}
