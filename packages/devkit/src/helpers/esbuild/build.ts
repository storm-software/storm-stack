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
import type { ESBuildOptions } from "@storm-software/esbuild/types";
import { compilerPlugin } from "@storm-stack/core/helpers/esbuild/compiler-plugin";
import { findMatch } from "@storm-stack/core/helpers/typescript/tsconfig";
import type { Context } from "@storm-stack/core/types/build";
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
  override: Partial<ESBuildOptions> & { alias?: Record<string, string> } = {}
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
    skipNodeModulesBundle: context.options.skipNodeModulesBundle,
    assets: [
      {
        "input": context.options.projectRoot,
        "glob": "README.md",
        "output": "/"
      },
      {
        "input": context.options.projectRoot,
        "glob": "CHANGELOG.md",
        "output": "/"
      },
      {
        "input": "",
        "glob": "LICENSE",
        "output": "/"
      }
    ]
  } as ESBuildOptions;
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
    } as ESBuildOptions["tsconfigRaw"];
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
            override?.alias ?? {},
            context.override?.alias ?? {},
            {
              "storm:init": joinPaths(context.runtimePath, "init"),
              "storm:app": joinPaths(context.runtimePath, "app"),
              "storm:env": joinPaths(context.runtimePath, "env"),
              "storm:context": joinPaths(context.runtimePath, "context"),
              "storm:error": joinPaths(context.runtimePath, "error"),
              "storm:event": joinPaths(context.runtimePath, "event"),
              "storm:id": joinPaths(context.runtimePath, "id"),
              "storm:storage": joinPaths(context.runtimePath, "storage"),
              "storm:log": joinPaths(context.runtimePath, "log"),
              "storm:payload": joinPaths(context.runtimePath, "payload"),
              "storm:result": joinPaths(context.runtimePath, "result")
            }
          );
        },
        esbuildPlugins: [compilerPlugin(context)]
      },
      override ?? {},
      context.override,
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
        noExternal: [
          "storm:init",
          "storm:app",
          "storm:context",
          "storm:env",
          "storm:error",
          "storm:event",
          "storm:id",
          "storm:storage",
          "storm:log",
          "storm:payload",
          "storm:result"
        ],
        skipNodeModulesBundle: true
      }
    ) as ESBuildOptions
  );
}
