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

/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import { StormStack } from "./index";

/**
 * Webpack plugin
 *
 * @example
 * ```js
 * // webpack.config.js
 * import StormStack from 'storm-stack/webpack'
 *
 * default export {
 *  plugins: [StormStack()],
 * }
 * ```
 */
const webpack = StormStack.webpack;
export default webpack;
export { webpack as "module.exports" };
