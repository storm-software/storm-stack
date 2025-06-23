/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { StormStack } from "./index";

/**
 * Rspack plugin
 *
 * @example
 * ```js
 * // rspack.config.js
 * import StormStack from 'storm-stack/rspack'
 *
 * default export {
 *  plugins: [StormStack()],
 * }
 * ```
 */
const rspack = StormStack.rspack;
export default rspack;
export { rspack as "module.exports" };
