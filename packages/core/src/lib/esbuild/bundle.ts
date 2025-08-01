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
import {
  build as esbuild,
  BuildOptions as ExternalESBuildOptions
} from "esbuild";
import type { ResolvedOptions } from "../../types/build";
import { ESBuildOverrideOptions } from "../../types/config";
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
  skipTransforms?: boolean;
  entry?: Entry;
  outputPath?: string;
  alias?: Record<string, string>;
  override?: Partial<ESBuildOverrideOptions>;
};

/**
 * Bundles the specified entry points using esbuild.
 *
 * @param context - Base context for the bundling process.
 * @param bundleOptions - Additional options for the bundling process.
 * @returns The result of the bundling process.
 */
export async function bundle(
  context: Context,
  bundleOptions: BundleOptions = {}
) {
  const options = defu(
    {
      plugins: [
        resolverPlugin(context, {
          external: bundleOptions.external,
          noExternal: bundleOptions.noExternal,
          skipNodeModulesBundle: bundleOptions.skipNodeModulesBundle
        }),
        bundleOptions.skipTransforms === true
          ? transpilerPlugin(context)
          : compilerPlugin(context)
      ]
    },
    resolveESBuildOptions(
      context,
      {
        outdir: bundleOptions.outputPath,
        entryPoints: resolveEsbuildEntryOptions(
          context,
          bundleOptions.entry
            ? Array.isArray(bundleOptions.entry)
              ? bundleOptions.entry
              : isString(bundleOptions.entry)
                ? [bundleOptions.entry]
                : Object.values(bundleOptions.entry)
            : []
        ),
        bundle: true
      },
      bundleOptions
    )
  ) as ExternalESBuildOptions;

  try {
    return await esbuild(options);
  } catch (error) {
    context.log(
      LogLevelLabel.ERROR,
      error?.message
        ? `An error occurred while bundling: ${error?.message}`
        : "An error occurred while bundling"
    );

    throw error;
  }
}
