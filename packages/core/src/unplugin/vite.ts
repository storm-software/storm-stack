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
import { createVitePlugin } from "unplugin";
import { ConfigEnv, UserConfig } from "vite";
import { resolveViteOptions } from "../lib/vite/options";
import { ViteResolvedOptions } from "../types/build";
import { createUnpluginFactory } from "./core/factory";

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import StormStack from '@storm-stack/core/vite'
 *
 * export default defineConfig({
 *   plugins: [StormStack()],
 * })
 * ```
 */
export const vite = createVitePlugin(
  createUnpluginFactory<ViteResolvedOptions>({
    framework: "vite",
    decorate: (engine, plugin) => {
      return {
        ...plugin,
        vite: {
          config: (config: UserConfig, env: ConfigEnv) => {
            engine.context.options.isPreview = !!env.isPreview;
            engine.context.options.isSsrBuild = !!env.isSsrBuild;
            engine.context.options.mode =
              env.mode === "development" ? "development" : "production";

            engine.context.options.build = resolveViteOptions(
              engine.context,
              defu(engine.context.options.override, config)
            );

            return engine.context.options.build;
          }
        }
      };
    }
  })
);

export default vite;
export { vite as "module.exports" };
