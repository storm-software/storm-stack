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
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import defu from "defu";
import { ESBuildOverrideOptions, UserConfig } from "../../types/config";
import { Context } from "../../types/context";
import { findMatch } from "../typescript/tsconfig";
import { compilerPlugin } from "./compiler-plugin";
import { resolverPlugin } from "./resolver-plugin";

export async function esbuild(
  context: Context,
  override: Partial<ESBuildOverrideOptions> = {}
) {
  const buildOptions = {
    mode: context.options.mode,
    platform: context.options.platform,
    projectRoot: context.options.projectRoot,
    outputPath: context.options.output.outputPath,
    tsconfig: context.tsconfig.tsconfigFilePath,
    metafile: context.options.mode === "development",
    minify: context.options.mode !== "development",
    sourcemap: context.options.mode === "development",
    generatePackageJson: context.options.esbuild.generatePackageJson,
    banner: {
      js:
        context.options.mode !== "production"
          ? "\n//  ⚡  Built with Storm Stack \n"
          : " "
    },
    external: context.options.external,
    noExternal: context.options.noExternal,
    skipNodeModulesBundle: context.options.skipNodeModulesBundle
  } as BaseESBuildOptions;
  if (context.options.output.dts !== false) {
    const dtsFilePath =
      context.options.output.dts ||
      joinPaths(context.options.projectRoot, "storm.d.ts");

    buildOptions.tsconfigRaw = {
      compilerOptions: {
        types: [
          ...(context.tsconfig.options.types?.filter(
            type =>
              type !==
              findMatch(
                joinPaths(
                  relativePath(
                    findFilePath(
                      joinPaths(context.options.workspaceRoot, dtsFilePath)
                    ),
                    joinPaths(
                      context.options.workspaceRoot,
                      context.options.projectRoot
                    )
                  ),
                  findFileName(dtsFilePath)
                ),
                context.tsconfig.options.types ?? []
              )
          ) ?? []),
          dtsFilePath
        ]
      }
    } as UserConfig["tsconfigRaw"];
  }

  if (!override.entry) {
    buildOptions.entry = context.entry.reduce(
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
    );
  }

  const options = defu(
    {
      // esbuildOptions(options) {
      //   options.alias = defu(
      //     override.alias ?? {},
      //     context.options.alias ?? {},
      //     context.vfs.getRuntimeFiles().reduce(
      //       (ret, file) => {
      //         ret[file.id] = file.contents?.toString() ?? "";
      //         return ret;
      //       },
      //       {} as Record<string, string>
      //     )
      //   );
      // },
      clean: false
    },
    override ?? {},
    context.options.esbuild.override,
    buildOptions,
    {
      dts: context.options.projectType !== "application",
      generatePackageJson: true,
      bundle: true,
      treeshake: true,
      shims: true,
      platform: "node",
      format: "esm",
      target: "node22",
      distDir: "dist",
      noExternal: Array.from(context.vfs.runtimeIdMap.keys()),
      skipNodeModulesBundle: true
    }
  ) as BaseESBuildOptions;

  delete options.esbuildPlugins;

  await build(
    defu(
      {
        esbuildPlugins: [
          resolverPlugin(context, {
            external: options.external,
            noExternal: options.noExternal,
            skipNodeModulesBundle: options.skipNodeModulesBundle
          }),
          compilerPlugin(context)
        ]
      } as BaseESBuildOptions,
      options
    )
  );
}
