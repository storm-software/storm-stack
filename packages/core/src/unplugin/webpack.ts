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

import { createWebpackPlugin } from "unplugin";
import { WebpackResolvedOptions } from "../types/build";
import { createUnpluginFactory } from "./core/factory";

/**
 * Webpack plugin
 *
 * @example
 * ```js
 * // webpack.config.js
 * import StormStack from '@storm-stack/core/webpack'
 *
 * default export {
 *  plugins: [StormStack()],
 * }
 * ```
 */
export const webpack = createWebpackPlugin(
  createUnpluginFactory<WebpackResolvedOptions>()
);

export default webpack;
export { webpack as "module.exports" };
