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

import { match, tsconfigPathsToRegExp } from "bundle-require";
import type { Plugin } from "esbuild";
import type { LogFn, Options } from "../../types";

// Must not start with "/" or "./" or "../" or "C:\" or be the exact strings ".." or "."
const NON_NODE_MODULE_REGEX = /^[A-Z]:[/\\]|^\.{0,2}\/|^\.{1,2}$/;

export const externalPlugin = (
  log: LogFn,
  options: Pick<
    Options,
    "external" | "noExternal" | "skipNodeModulesBundle"
  > = {},
  tsconfigResolvePaths: Record<string, any> = {}
): Plugin => {
  // const log = createLog("external-plugin", options);

  return {
    name: "storm-stack:external",
    setup(build) {
      const external = options.external ?? [];
      const noExternal = options.noExternal ?? [];
      const skipNodeModulesBundle = options.skipNodeModulesBundle ?? false;

      if (skipNodeModulesBundle) {
        const resolvePatterns = tsconfigPathsToRegExp(tsconfigResolvePaths);
        build.onResolve({ filter: /.*/ }, args => {
          // Resolve `paths` from tsconfig
          if (
            match(args.path, resolvePatterns) ||
            args.path.startsWith("internal:") ||
            args.path.startsWith("virtual:") ||
            args.path.startsWith("storm:")
          ) {
            return;
          }
          // Respect explicit external/noExternal conditions
          if (match(args.path, noExternal)) {
            return;
          }
          if (match(args.path, external)) {
            return { external: true };
          }
          // Exclude any other import that looks like a Node module
          if (!NON_NODE_MODULE_REGEX.test(args.path)) {
            return {
              path: args.path,
              external: true
            };
          }

          // eslint-disable-next-line no-useless-return
          return;
        });
      } else {
        build.onResolve({ filter: /.*/ }, args => {
          // Respect explicit external/noExternal conditions
          if (match(args.path, noExternal)) {
            return;
          }
          if (match(args.path, external)) {
            return { external: true };
          }

          // eslint-disable-next-line no-useless-return
          return;
        });
      }
    }
  };
};
