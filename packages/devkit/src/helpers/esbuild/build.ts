/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { build } from "@storm-software/esbuild/build";
import type { ESBuildOptions } from "@storm-software/esbuild/types";
import { compilerPlugin } from "@storm-stack/core/helpers/esbuild/compiler-plugin";
import type { Context, Options } from "@storm-stack/core/types/build";
import { findFileExtension } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";

export async function esbuild<TOptions extends Options = Options>(
  context: Context<TOptions>,
  override: Partial<ESBuildOptions> & { alias?: Record<string, string> } = {}
) {
  const runtimeDir = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    context.artifactsDir,
    "runtime"
  );

  const buildOptions = {
    mode: context.options.mode,
    platform: context.options.platform,
    projectRoot: context.options.projectRoot,
    outputPath: context.options.outputPath,
    tsconfig: context.options.tsconfig,
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

  if (!override.entry) {
    buildOptions.entry = context.entry.reduce(
      (ret, entry) => {
        ret[
          entry.output ||
            entry.input.file
              .replace(
                `${context.projectJson?.sourceRoot || context.options.projectRoot}/`,
                ""
              )
              .replace(findFileExtension(entry.input.file), "") ||
            entry.file
              .replace(
                `${context.projectJson?.sourceRoot || context.options.projectRoot}/`,
                ""
              )
              .replace(findFileExtension(entry.file), "")
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
              "storm:init": joinPaths(runtimeDir, "init"),
              "storm:app": joinPaths(runtimeDir, "app"),
              "storm:env": joinPaths(runtimeDir, "env"),
              "storm:context": joinPaths(runtimeDir, "context"),
              "storm:error": joinPaths(runtimeDir, "error"),
              "storm:event": joinPaths(runtimeDir, "event"),
              "storm:id": joinPaths(runtimeDir, "id"),
              "storm:storage": joinPaths(runtimeDir, "storage"),
              "storm:log": joinPaths(runtimeDir, "log"),
              "storm:payload": joinPaths(runtimeDir, "payload"),
              "storm:result": joinPaths(runtimeDir, "result")
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
