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

import { ViteResolvedOptions } from "../types";
import StormStackVite from "./vite";

/**
 * Astro plugin
 *
 * @example
 * ```js
 * // astro.config.js
 * import StormStack from '@storm-stack/core/astro'
 *
 * default export {
 *  plugins: [StormStack()],
 * }
 * ```
 */
export const astro = (
  config: Partial<Omit<ViteResolvedOptions["userConfig"], "variant">>
): any => ({
  name: "storm-stack",
  hooks: {
    // eslint-disable-next-line ts/naming-convention
    "astro:config:setup": async (build: any) => {
      build.config.vite.plugins ||= [];
      // eslint-disable-next-line ts/no-unsafe-call
      build.config.vite.plugins.push(StormStackVite(config));
    }
  }
});

export default astro;
export { astro as "module.exports" };
