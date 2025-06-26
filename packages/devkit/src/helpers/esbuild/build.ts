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

import { build } from "@storm-software/esbuild/build";
import type { ESBuildOptions as BaseESBuildOptions } from "@storm-software/esbuild/types";
import { compilerPlugin } from "@storm-stack/core/helpers/esbuild/compiler-plugin";
import { findMatch } from "@storm-stack/core/helpers/typescript/tsconfig";
import type { Context } from "@storm-stack/core/types/build";
import {
  ESBuildOverrideOptions,
  UserConfig
} from "@storm-stack/core/types/config";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import defu from "defu";

export async function esbuild(
  context: Context,
  override: Partial<ESBuildOverrideOptions> = {}
) {
  const buildOptions = {
    mode: context.options.mode,
    platform: context.options.platform,
    projectRoot: context.options.projectRoot,
    outputPath: context.options.outputPath,
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
    env: context.dotenv.values as {
      [key: string]: string;
    },
    external: context.options.external,
    noExternal: context.options.noExternal,
    skipNodeModulesBundle: context.options.skipNodeModulesBundle
  } as BaseESBuildOptions;
  if (context.options.dts !== false) {
    const dtsFilePath =
      context.options.dts ||
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
                      joinPaths(
                        context.workspaceConfig.workspaceRoot,
                        dtsFilePath
                      )
                    ),
                    joinPaths(
                      context.workspaceConfig.workspaceRoot,
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

  await build(
    defu(
      {
        esbuildOptions(options) {
          options.alias = defu(
            override.alias ?? {},
            context.options.alias ?? {},
            context.vfs.getRuntime().reduce(
              (ret, file) => {
                ret[file.id] = file.contents?.toString() ?? "";

                return ret;
              },
              {} as Record<string, string>
            )
          );
        },
        esbuildPlugins: [compilerPlugin(context)]
      },
      override ?? {},
      context.options.esbuild.override,
      buildOptions,
      {
        dts: true,
        generatePackageJson: true,
        bundle: true,
        treeshake: true,
        shims: true,
        platform: "node",
        format: "esm",
        target: "node22",
        distDir: "dist",
        // noExternal: [...context.vfs.getRuntime().map(file => file.id)],
        skipNodeModulesBundle: true
      }
    ) as BaseESBuildOptions
  );
}
