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

import { tsconfigPathsToRegExp } from "bundle-require";
import type { OnResolveArgs, Plugin } from "esbuild";
import type { ResolvedOptions } from "../../types/build";
import type { Context } from "../../types/context";
import { handleResolveId } from "../unplugin/resolve-id";

export const resolverPlugin = (
  context: Context,
  options: Pick<
    ResolvedOptions,
    "external" | "noExternal" | "skipNodeModulesBundle"
  > = {}
): Plugin => {
  return {
    name: "storm-stack:resolver",
    setup(build) {
      const skipNodeModulesBundle =
        options.skipNodeModulesBundle ?? context.options.skipNodeModulesBundle;
      const external = options.external ?? context.options.external ?? [];
      const noExternal = options.noExternal ?? context.options.noExternal ?? [];
      const resolvePatterns = skipNodeModulesBundle
        ? tsconfigPathsToRegExp(context.tsconfig.options.paths ?? [])
        : [];

      const handle = async (args: OnResolveArgs) => {
        const result = await handleResolveId(
          context,
          {
            id: args.path,
            importer: args.importer,
            options: {
              isEntry: false
            }
          },
          {
            skipNodeModulesBundle,
            external,
            noExternal,
            resolvePatterns
          }
        );
        if (!result) {
          return;
        }

        return {
          path: result?.id,
          external: result?.external
        };
      };

      build.onResolve({ filter: /.*/ }, handle);
      build.onResolve({ filter: /^storm:/ }, handle);
    }
  };
};
