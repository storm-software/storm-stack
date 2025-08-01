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

import { match, tsconfigPathsToRegExp } from "bundle-require";
import type { Plugin } from "esbuild";
import type { ResolvedOptions } from "../../types/build";
import type { Context } from "../../types/context";

// Must not start with "/" or "./" or "../" or "C:\" or be the exact strings ".." or "."
const NON_NODE_MODULE_REGEX = /^[A-Z]:[/\\]|^\.{0,2}\/|^\.{1,2}$/;

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

      if (skipNodeModulesBundle) {
        const resolvePatterns = tsconfigPathsToRegExp(
          context.tsconfig.options.paths ?? []
        );

        build.onResolve({ filter: /.*/ }, args => {
          if (args.path) {
            if (
              context.vfs.isVirtualFile(args.path, {
                paths: [args.resolveDir]
              }) ||
              (args.importer && context.vfs.isVirtualFile(args.importer))
            ) {
              const resolvedPath = context.vfs.resolvePath(args.path, {
                paths: [args.resolveDir]
              });
              if (resolvedPath) {
                return {
                  path: resolvedPath,
                  external: context.options.projectType !== "application"
                };
              }
            }

            if (context.vfs.isTsconfigPath(args.path)) {
              const tsconfigPath = context.vfs.resolveTsconfigPath(args.path);
              const tsconfigPathPackage =
                context.vfs.resolveTsconfigPathPackage(args.path);
              if (tsconfigPath && tsconfigPathPackage) {
                return {
                  path: tsconfigPath,
                  external:
                    !noExternal.includes(tsconfigPathPackage) &&
                    (external.includes(tsconfigPathPackage) ||
                      context.options.projectType !== "application")
                };
              }
            }

            if (
              match(args.path, resolvePatterns) ||
              match(args.path, noExternal) ||
              args.path.startsWith("internal:") ||
              args.path.startsWith("virtual:")
            ) {
              return;
            }

            if (match(args.path, external) || args.path.startsWith("node:")) {
              return { external: true };
            }

            // Exclude any other import that looks like a Node module
            if (!NON_NODE_MODULE_REGEX.test(args.path)) {
              return {
                path: args.path,
                external: true
              };
            }
          }

          // eslint-disable-next-line no-useless-return
          return;
        });
      } else {
        build.onResolve({ filter: /.*/ }, args => {
          if (args.path) {
            if (
              context.vfs.isVirtualFile(args.path, {
                paths: [args.resolveDir]
              }) ||
              (args.importer && context.vfs.isVirtualFile(args.importer))
            ) {
              const resolvedPath = context.vfs.resolvePath(args.path, {
                paths: [args.resolveDir]
              });
              if (resolvedPath) {
                return {
                  path: resolvedPath,
                  external: context.options.projectType !== "application"
                };
              }
            }

            if (context.vfs.isTsconfigPath(args.path)) {
              const tsconfigPath = context.vfs.resolveTsconfigPath(args.path);
              const tsconfigPathPackage =
                context.vfs.resolveTsconfigPathPackage(args.path);
              if (tsconfigPath && tsconfigPathPackage) {
                return {
                  path: tsconfigPath,
                  external:
                    !noExternal.includes(tsconfigPathPackage) &&
                    (external.includes(tsconfigPathPackage) ||
                      context.options.projectType !== "application")
                };
              }
            }

            if (
              match(args.path, noExternal) ||
              context.vfs.isRuntimeFile(args.path, {
                paths: [args.resolveDir, args.importer]
              })
            ) {
              return;
            }

            if (match(args.path, external) || args.path.startsWith("node:")) {
              return { external: true };
            }
          }

          // eslint-disable-next-line no-useless-return
          return;
        });
      }
    }
  };
};
