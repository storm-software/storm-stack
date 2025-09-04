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

import { isUndefined } from "@stryke/type-checks/is-undefined";
import { BuildOptions } from "esbuild";
import { createEsbuildPlugin } from "unplugin";
import { resolveESBuildOptions } from "../lib/esbuild/options";
import { ESBuildResolvedOptions } from "../types";
import { createUnpluginFactory } from "./core/factory";

/**
 * ESBuild plugin
 *
 * @example
 * ```js
 * // esbuild.config.js
 * import StormStack from '@storm-stack/core/esbuild'
 *
 * default export {
 *  plugins: [StormStack()],
 * }
 * ```
 */
export const esbuild = createEsbuildPlugin(
  createUnpluginFactory<ESBuildResolvedOptions>({
    framework: "esbuild",
    decorate: (engine, plugin) => {
      return {
        ...plugin,
        esbuild: {
          config: (options: BuildOptions) => {
            const opts = resolveESBuildOptions(engine.context, options);
            for (const key in opts) {
              if (
                isUndefined(options[key as keyof BuildOptions]) &&
                !isUndefined(opts[key as keyof BuildOptions])
              ) {
                options[key as keyof BuildOptions] = opts[
                  key as keyof BuildOptions
                ] as any;
              }
            }
          }
        }
      };
    }
  })
);

export default esbuild;
export { esbuild as "module.exports" };
