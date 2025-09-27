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

import alloyPreset from "@alloy-js/babel-preset";
import { getBabelInputPlugin } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import { toArray } from "@stryke/convert/to-array";
import { joinPaths } from "@stryke/path/join-paths";
import { isFunction } from "@stryke/type-checks/is-function";
import { isString } from "@stryke/type-checks/is-string";
import defu from "defu";
import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import typescriptPlugin from "rollup-plugin-typescript2";
import { RollupOptions, ViteOptions } from "../../types/config";
import { Context } from "../../types/context";
import { dtsBundlePlugin } from "./dts-bundle-plugin";

/**
 * Resolves the options for [rollup](https://rollupjs.org).
 *
 * @param context - The build context.
 * @param override - The user-defined options.
 * @returns The resolved options.
 */
export function resolveRollupOptions<TContext extends Context = Context>(
  context: TContext,
  override: Partial<RollupOptions> = {}
): RollupOptions {
  // cache?: boolean | RollupCache | undefined;
  // context?: string | undefined;
  // experimentalCacheExpiry?: number | undefined;
  // experimentalLogSideEffects?: boolean | undefined;
  // external?: ExternalOption | undefined;
  // fs?: RollupFsModule | undefined;
  // input?: InputOption | undefined;
  // jsx?: false | JsxPreset | JsxOptions | undefined;
  // logLevel?: LogLevelOption | undefined;
  // makeAbsoluteExternalsRelative?: boolean | 'ifRelativeSource' | undefined;
  // maxParallelFileOps?: number | undefined;
  // moduleContext?: ((id: string) => string | NullValue) | Record<string, string> | undefined;
  // onLog?: LogHandlerWithDefault | undefined;
  // onwarn?: WarningHandlerWithDefault | undefined;
  // perf?: boolean | undefined;
  // plugins?: InputPluginOption | undefined;
  // preserveEntrySignatures?: PreserveEntrySignaturesOption | undefined;
  // preserveSymlinks?: boolean | undefined;
  // shimMissingExports?: boolean | undefined;
  // strictDeprecations?: boolean | undefined;
  // treeshake?: boolean | TreeshakingPreset | TreeshakingOptions | undefined;
  // watch?: WatcherOptions | false | undefined;

  // Output
  //  amd?: AmdOptions | undefined;
  //   assetFileNames?: string | ((chunkInfo: PreRenderedAsset) => string) | undefined;
  //   banner?: string | AddonFunction | undefined;
  //   chunkFileNames?: string | ((chunkInfo: PreRenderedChunk) => string) | undefined;
  //   compact?: boolean | undefined;
  //   // only required for bundle.write
  //   dir?: string | undefined;
  //   dynamicImportInCjs?: boolean | undefined;
  //   entryFileNames?: string | ((chunkInfo: PreRenderedChunk) => string) | undefined;
  //   esModule?: boolean | 'if-default-prop' | undefined;
  //   experimentalMinChunkSize?: number | undefined;
  //   exports?: 'default' | 'named' | 'none' | 'auto' | undefined;
  //   extend?: boolean | undefined;
  //   /** @deprecated Use "externalImportAttributes" instead. */
  //   externalImportAssertions?: boolean | undefined;
  //   externalImportAttributes?: boolean | undefined;
  //   externalLiveBindings?: boolean | undefined;
  //   // only required for bundle.write
  //   file?: string | undefined;
  //   footer?: string | AddonFunction | undefined;
  //   format?: ModuleFormat | undefined;
  //   freeze?: boolean | undefined;
  //   generatedCode?: GeneratedCodePreset | GeneratedCodeOptions | undefined;
  //   globals?: GlobalsOption | undefined;
  //   hashCharacters?: HashCharacters | undefined;
  //   hoistTransitiveImports?: boolean | undefined;
  //   importAttributesKey?: ImportAttributesKey | undefined;
  //   indent?: string | boolean | undefined;
  //   inlineDynamicImports?: boolean | undefined;
  //   interop?: InteropType | GetInterop | undefined;
  //   intro?: string | AddonFunction | undefined;
  //   manualChunks?: ManualChunksOption | undefined;
  //   minifyInternalExports?: boolean | undefined;
  //   name?: string | undefined;
  //   noConflict?: boolean | undefined;
  //   /** @deprecated This will be the new default in Rollup 5. */
  //   onlyExplicitManualChunks?: boolean | undefined;
  //   outro?: string | AddonFunction | undefined;
  //   paths?: OptionsPaths | undefined;
  //   plugins?: OutputPluginOption | undefined;
  //   preserveModules?: boolean | undefined;
  //   preserveModulesRoot?: string | undefined;
  //   reexportProtoFromExternal?: boolean | undefined;
  //   sanitizeFileName?: boolean | ((fileName: string) => string) | undefined;
  //   sourcemap?: boolean | 'inline' | 'hidden' | undefined;
  //   sourcemapBaseUrl?: string | undefined;
  //   sourcemapExcludeSources?: boolean | undefined;
  //   sourcemapFile?: string | undefined;
  //   sourcemapFileNames?: string | ((chunkInfo: PreRenderedChunk) => string) | undefined;
  //   sourcemapIgnoreList?: boolean | SourcemapIgnoreListOption | undefined;
  //   sourcemapPathTransform?: SourcemapPathTransformOption | undefined;
  //   sourcemapDebugIds?: boolean | undefined;
  //   strict?: boolean | undefined;
  //   systemNullSetters?: boolean | undefined;
  //   validate?: boolean | undefined;
  //   virtualDirname?: string | undefined;

  const result = defu(
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
                    (context.options.override as Partial<RollupOptions>)
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
                        (context.options.build as RollupOptions).external
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
        getBabelInputPlugin({
          caller: {
            name: "storm-stack",
            supportsStaticESM: true
          },
          cwd: fileURLToPath(new URL("/", import.meta.url)),
          babelrc: false,
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          babelHelpers: "bundled",
          skipPreflightCheck: true,
          exclude: /node_modules/,
          presets: [alloyPreset]
        }),
        resolve({
          moduleDirectories: ["node_modules"],
          preferBuiltins: true
        }),
        dtsBundlePlugin
      ]

      // resolve: {
      //   alias: context.vfs.builtinIdMap.keys().reduce(
      //     (ret, id) => {
      //       const path = context.vfs.builtinIdMap.get(id);
      //       if (path) {
      //         ret[id] = path;
      //       }

      //       return ret;
      //     },
      //     {} as Record<string, string>
      //   )
      // }
    },
    override,
    context.options.variant === "rollup" ? context.options.override : {},
    context.options.variant === "vite"
      ? context.options.override.build?.rollupOptions
      : {},
    {
      cache: !context.options.skipCache
        ? joinPaths(context.cachePath, "rollup")
        : false,
      output: {
        dir: context.options.output.outputPath,
        sourcemap: context.options.mode === "development"
      },
      logLevel: context.options.logLevel
    } as RollupOptions,
    context.options.variant === "rollup" ? context.options.build : {},
    context.options.variant === "vite"
      ? context.options.build.build?.rollupOptions
      : {},
    {
      logLevel: "silent"
    }
  ) as RollupOptions;

  return result;
}
