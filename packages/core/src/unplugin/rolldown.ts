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

import { createRolldownPlugin } from "unplugin";
import { RolldownResolvedOptions } from "../types";
import { createUnpluginFactory } from "./core/factory";

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.ts
 * import StormStack from '@storm-stack/core/rollup'
 *
 * export default defineConfig({
 *   plugins: [StormStack()],
 * })
 * ```
 */
export const rolldown = createRolldownPlugin(
  createUnpluginFactory<RolldownResolvedOptions>()
);

export default rolldown;
export { rolldown as "module.exports" };
