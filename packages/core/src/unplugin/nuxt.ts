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

import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
import "@nuxt/schema";
import type { ViteUserConfig, WebpackUserConfig } from "../types/config";
import StormStackVite from "./vite";
import StormStackWebpack from "./webpack";

/**
 * Nuxt plugin
 *
 * @example
 * ```js
 * // nuxt.config.js
 * import StormStack from '@storm-stack/core/nuxt'
 *
 * default export {
 *  plugins: [StormStack()],
 * }
 * ```
 */
export const nuxt = defineNuxtModule<
  Omit<ViteUserConfig & WebpackUserConfig, "variant">
>({
  meta: {
    name: "storm-stack",
    configKey: "storm"
  },
  defaults: {},
  setup(options, _nuxt) {
    addVitePlugin(() => StormStackVite(options));
    addWebpackPlugin(() => StormStackWebpack(options));
  }
});

export default nuxt;
export { nuxt as "module.exports" };
