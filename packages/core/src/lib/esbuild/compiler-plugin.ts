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

import defu from "defu";
import type { OnLoadArgs, Plugin } from "esbuild";
import type { CompilerOptions } from "../../types/compiler";
import { Context } from "../../types/context";
import { ModuleResolverPlugin } from "../babel/plugins/module-resolver";

/**
 * Create a compiler plugin for esbuild that compiles TypeScript files.
 *
 * @param context - The base context containing TypeScript configuration and options.
 * @param options - Optional compiler options to customize the TypeScript compilation.
 * @returns An esbuild plugin that compiles TypeScript files.
 */
export function compilerPlugin(
  context: Context,
  options: CompilerOptions = {}
): Plugin {
  const cache = new Map<string, string>();

  const handleLoad = async (args: OnLoadArgs) => {
    if (args.path) {
      const resolvedPath = context.vfs.resolvePath(args.path, {
        type: "file"
      });

      if (resolvedPath) {
        if (cache.has(resolvedPath)) {
          return {
            contents: cache.get(resolvedPath),
            pluginData: args.pluginData
          };
        }

        const contents = await context.vfs.readFile(resolvedPath);
        if (!contents) {
          return;
        }

        const result = await context.compiler.compile(
          context,
          resolvedPath,
          contents,
          defu(options, {
            babel: {
              plugins: [
                ModuleResolverPlugin(context),
                ...context.options.babel.plugins
              ]
            }
          })
        );

        cache.set(args.path, result);

        return {
          contents: result,
          pluginData: args.pluginData
        };
      }
    }

    // eslint-disable-next-line no-useless-return
    return;
  };

  return {
    name: "storm-stack:compiler",
    setup(build) {
      build.onLoad({ filter: /.*/ }, handleLoad);
      build.onLoad({ filter: /^storm:/ }, handleLoad);
    }
  };
}
