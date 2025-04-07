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

import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
import "@nuxt/schema";
import type { Options } from "../types";
import { StormStack } from "./index";

/**
 * Nuxt plugin
 *
 * @example
 * ```js
 * // nuxt.config.js
 * import StormStack from 'storm-stack/nuxt'
 *
 * default export {
 *  plugins: [StormStack()],
 * }
 * ```
 */
const nuxt = defineNuxtModule<Options>({
  meta: {
    name: "storm-stack",
    configKey: "storm"
  },
  defaults: {},
  setup(options, _nuxt) {
    addVitePlugin(() => StormStack.vite(options));
    addWebpackPlugin(() => StormStack.webpack(options));
  }
});
export default nuxt;
export { nuxt as "module.exports" };
