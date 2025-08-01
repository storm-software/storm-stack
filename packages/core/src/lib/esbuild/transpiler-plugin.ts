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

import type { Plugin } from "esbuild";
import type { Context } from "../../types/context";
import { ModuleResolverPlugin } from "../babel/plugins/module-resolver";

/**
 * Create a transpiler plugin for esbuild that transpiles TypeScript files.
 *
 * @param context - The base context containing TypeScript configuration and options.
 * @returns An esbuild plugin that transpiles TypeScript files.
 */
export function transpilerPlugin(context: Context): Plugin {
  const handleLoad = async args => {
    if (args.path) {
      const resolvedPath = context.vfs.resolvePath(args.path);
      if (resolvedPath) {
        const contents = await context.vfs.readFile(resolvedPath);
        if (!contents) {
          return;
        }

        const result = await context.compiler.transpile(
          context,
          resolvedPath,
          contents,
          {
            skipTransformUnimport: true,
            babel: {
              plugins: [
                ModuleResolverPlugin(context),
                ...context.options.babel.plugins
              ]
            }
          }
        );

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
    name: "storm-stack:transpiler",
    setup(build) {
      build.onLoad({ filter: /.*/ }, handleLoad);
      build.onLoad({ filter: /^storm:/ }, handleLoad);
    }
  };
}
