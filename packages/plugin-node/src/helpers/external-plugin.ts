/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import type { Options } from "@storm-stack/core/types";
import { match, tsconfigPathsToRegExp } from "bundle-require";
import type { Plugin } from "esbuild";

// Must not start with "/" or "./" or "../" or "C:\" or be the exact strings ".." or "."
const NON_NODE_MODULE_RE = /^[A-Z]:[/\\]|^\.{0,2}\/|^\.{1,2}$/;

export const externalPlugin = (
  options: Options,
  tsconfigResolvePaths: Record<string, any> = {}
): Plugin => {
  // const log = createLog("external-plugin", options);

  return {
    name: "storm-stack:external",
    setup(build) {
      const external = options.external ?? [];
      const noExternal = options.noExternal ?? [];
      const skipNodeModulesBundle = false;

      if (skipNodeModulesBundle) {
        const resolvePatterns = tsconfigPathsToRegExp(tsconfigResolvePaths);
        build.onResolve({ filter: /.*/ }, args => {
          // Resolve `paths` from tsconfig
          if (match(args.path, resolvePatterns)) {
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
          if (!NON_NODE_MODULE_RE.test(args.path)) {
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
