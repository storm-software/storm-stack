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
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { isString } from "@stryke/type-checks/is-string";
import defu from "defu";
import { build } from "esbuild";
import type { ResolvedOptions } from "../../types/build";
import { CompilerOptions } from "../../types/compiler";
import { ESBuildOptions } from "../../types/config";
import type { Context } from "../../types/context";
import { compilerPlugin } from "./compiler-plugin";
import { resolveEsbuildEntryOptions, resolveESBuildOptions } from "./options";
import { resolverPlugin } from "./resolver-plugin";
import { transpilerPlugin } from "./transpiler-plugin";

/**
 * Options for the bundling process using esbuild. This type extends the ResolvedOptions type to include additional properties specific to the bundling process.
 */
export type BundleOptions = Pick<
  ResolvedOptions,
  "external" | "noExternal" | "skipNodeModulesBundle"
> & {
  entry?: Entry;
  outputPath?: string;
  alias?: Record<string, string>;
  override?: Partial<ESBuildOptions>;
  compiler?: CompilerOptions;
};

/**
 * Bundles the specified entry points using [esbuild](https://esbuild.github.io/).
 *
 * @param context - Base context for the bundling process.
 * @param options - Additional options for the bundling process.
 * @returns The result of the bundling process.
 */
export async function esbuild(context: Context, options: BundleOptions = {}) {
  try {
    const opts = resolveESBuildOptions(
      context,
      {
        outdir: options.outputPath,
        bundle: true
      },
      options
    );

    return await build(
      defu(
        {
          entryPoints: resolveEsbuildEntryOptions(
            context,
            options.entry
              ? Array.isArray(options.entry)
                ? options.entry
                : isString(options.entry)
                  ? [options.entry]
                  : Object.values(options.entry)
              : []
          ),
          plugins: [
            resolverPlugin(context, {
              external:
                opts.external ?? options.external ?? context.options.external,
              noExternal: options.noExternal ?? context.options.noExternal,
              skipNodeModulesBundle:
                options.skipNodeModulesBundle ??
                context.options.skipNodeModulesBundle
            }),
            options.compiler?.skipAllTransforms === true
              ? transpilerPlugin(context, options.compiler)
              : compilerPlugin(context, options.compiler)
          ].filter(Boolean)
        },
        opts
      )
    );
  } catch (error) {
    context.log(
      LogLevelLabel.ERROR,
      (error as Error)?.message
        ? `An error occurred while running esbuild: ${
            (error as Error)?.message
          }`
        : "An error occurred while running esbuild"
    );

    throw error;
  }
}
