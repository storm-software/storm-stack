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
import { isFunction } from "@stryke/type-checks/is-function";
import defu from "defu";
import { BuildOptions } from "esbuild";
import { Format } from "tsup";
import { TsupOptions } from "../../types/config";
import { Context } from "../../types/context";
import { compilerPlugin } from "../esbuild/compiler-plugin";
import { resolverPlugin } from "../esbuild/resolver-plugin";
import { resolveTsupEntryOptions, resolveTsupOptions } from "./options";

/**
 * Build the project using tsup
 *
 * @param context - The context of the build
 * @param override - The override options for the build
 */
export async function tsup(
  context: Context,
  override: Partial<TsupOptions> = {}
) {
  const opts = defu(
    {
      entry: resolveTsupEntryOptions(context, context.entry)
    },
    resolveTsupOptions(context, override)
  ) as TsupOptions;

  await build({
    ...defu(
      {
        config: false,
        clean: true,
        esbuildOptions(
          buildOptions: BuildOptions,
          ctx: {
            format: Format;
          }
        ) {
          if (isFunction(opts.esbuildOptions)) {
            opts.esbuildOptions(buildOptions, ctx);
          }

          buildOptions.alias = defu(
            buildOptions.alias ?? {},
            Object.fromEntries(context.vfs.runtimeIdMap.entries())
          );
        },
        esbuildPlugins: [
          resolverPlugin(context, {
            external: override.external ?? context.options.external,
            noExternal: override.noExternal ?? context.options.noExternal,
            skipNodeModulesBundle:
              override.skipNodeModulesBundle ??
              context.options.skipNodeModulesBundle
          }),
          compilerPlugin(context)
        ]
      },
      opts
    ),
    projectRoot: context.options.projectRoot,
    ...(context.options.variant === "tsup" ? context.options.override : {})
  });
}
