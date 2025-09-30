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

import {
  getBabelInputPlugin,
  RollupBabelInputPluginOptions
} from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import { toArray } from "@stryke/convert/to-array";
import { joinPaths } from "@stryke/path/join-paths";
import { isFunction } from "@stryke/type-checks/is-function";
import { isString } from "@stryke/type-checks/is-string";
import defu from "defu";
import { globSync } from "node:fs";
import { BuildOptions } from "rolldown";
import { aliasPlugin } from "rolldown/experimental";
import typescriptPlugin from "rollup-plugin-typescript2";
import { RolldownOptions, ViteOptions } from "../../types/config";
import { Context } from "../../types/context";
import { dtsBundlePlugin } from "../rollup/dts-bundle-plugin";

/**
 * Resolves the options for [rolldown](https://rolldown.rs).
 *
 * @param context - The build context.
 * @param override - The user-defined options.
 * @returns The resolved options.
 */
export function resolveRolldownOptions<TContext extends Context = Context>(
  context: TContext,
  override: Partial<RolldownOptions> = {}
): BuildOptions {
  const merged = defu(
    {
      input: globSync(
        toArray(context.options.entry).map(entry =>
          isString(entry) ? entry : entry.file
        )
      ).flat(),
      external: (
        source: string,
        importer: string | undefined,
        isResolved: boolean
      ) => {
        const externalFn =
          context.options.variant === "rollup" &&
          context.options.override.external
            ? isFunction(context.options.override.external)
              ? context.options.override.external
              : id =>
                  toArray(
                    (context.options.override as Partial<RolldownOptions>)
                      .external
                  ).includes(id)
            : context.options.variant === "vite" &&
                context.options.override.build?.rollupOptions?.external
              ? isFunction(
                  context.options.override.build?.rollupOptions.external
                )
                ? context.options.override.build?.rollupOptions.external
                : id =>
                    toArray(
                      (context.options.build as ViteOptions)?.build
                        ?.rollupOptions?.external
                    ).includes(id)
              : context.options.variant === "rollup" && context.options.external
                ? isFunction(context.options.external)
                  ? context.options.external
                  : id =>
                      toArray(
                        (context.options.build as RolldownOptions).external
                      ).includes(id)
                : context.options.variant === "vite" &&
                    context.options.build.build?.rollupOptions?.external
                  ? isFunction(
                      context.options.build.build?.rollupOptions.external
                    )
                    ? context.options.build.build?.rollupOptions.external
                    : id =>
                        toArray(
                          (context.options.build as ViteOptions)?.build
                            ?.rollupOptions?.external
                        ).includes(id)
                  : undefined;
        if (
          isFunction(externalFn) &&
          externalFn(source, importer, isResolved)
        ) {
          return true;
        }

        if (
          context.options.external &&
          toArray(context.options.external).includes(source)
        ) {
          return true;
        }

        if (
          context.options.noExternal &&
          toArray(context.options.noExternal).includes(source)
        ) {
          return false;
        }

        if (Array.from(context.vfs.builtinIdMap.keys()).includes(source)) {
          return context.options.projectType !== "application";
        }

        return !context.options.skipNodeModulesBundle;
      },
      plugins: [
        typescriptPlugin({
          check: false,
          tsconfig: context.tsconfig.tsconfigFilePath
        }),
        aliasPlugin({
          entries: context.vfs.builtinIdMap.keys().reduce(
            (ret, id) => {
              if (!ret.find(e => e.find === id)) {
                const path = context.vfs.builtinIdMap.get(id);
                if (path) {
                  ret.push({ find: id, replacement: path });
                }
              }

              return ret;
            },
            [] as { find: string; replacement: string }[]
          )
        }),
        getBabelInputPlugin(
          defu(context.options.babel, {
            caller: {
              name: "storm-stack",
              supportsStaticESM: true
            },
            cwd: context.options.projectRoot,
            babelrc: false,
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            babelHelpers: "bundled",
            skipPreflightCheck: true,
            exclude: /node_modules/
          }) as RollupBabelInputPluginOptions
        ),
        resolve({
          moduleDirectories: ["node_modules"],
          preferBuiltins: true
        }),
        dtsBundlePlugin
      ]
    },
    override,
    context.options.variant === "rolldown" ||
      context.options.variant === "rollup"
      ? context.options.override
      : {},
    context.options.variant === "vite"
      ? context.options.override.build?.rollupOptions
      : {},
    {
      resolve: {
        alias: Object.fromEntries(context.vfs.builtinIdMap.entries())
      },
      platform: context.options.platform,
      tsconfig: context.tsconfig.tsconfigFilePath,
      minify: context.options.mode === "production",
      cache: !context.options.skipCache
        ? joinPaths(context.cachePath, "rolldown")
        : false,
      output: {
        dir: context.options.output.outputPath,
        sourcemap: context.options.mode === "development"
      },
      logLevel: context.options.logLevel
    } as RolldownOptions,
    context.options.variant === "rolldown" ||
      context.options.variant === "rollup"
      ? context.options.build
      : {},
    context.options.variant === "vite"
      ? context.options.build.build?.rollupOptions
      : {},
    {
      jsx: "automatic",
      logLevel: "silent",
      keepNames: true,
      treeshake: true,
      output: [
        {
          format: "es",
          preserveModules: true
        },
        {
          format: "cjs",
          preserveModules: true
        }
      ]
    }
  ) as BuildOptions;

  return merged;
}
