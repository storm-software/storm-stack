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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { extendLog } from "@storm-stack/core/lib/logger";
import {
  ResolvedEntryTypeDefinition,
  ViteResolvedOptions
} from "@storm-stack/core/types/build";
import { Context } from "@storm-stack/core/types/context";
import chalk from "chalk";
import { VitePlugin, VitePluginBuilder } from "../types/vite";

/**
 * Declare a Vite plugin using the provided builder function.
 *
 * @param name - The name of the plugin.
 * @param builder - The builder function that defines the plugin behavior.
 * @returns A Vite plugin declaration.
 */
export function declareVite<
  TOptions extends Record<string, any> = Record<string, any>,
  TContext extends Context<ViteResolvedOptions> = Context<
    ViteResolvedOptions,
    // eslint-disable-next-line ts/no-empty-object-type
    {},
    ResolvedEntryTypeDefinition
  >
>(
  name: string,
  builder: VitePluginBuilder<TOptions, TContext>
): (options: TOptions) => (context: TContext) => VitePlugin {
  return (options: TOptions) => (context: TContext) => {
    const log = extendLog(context.log, name);
    log(
      LogLevelLabel.TRACE,
      `Initializing the ${chalk.bold.cyanBright(name)} Vite plugin`
    );

    const result = builder({
      log,
      name,
      options,
      context
    });

    log(
      LogLevelLabel.TRACE,
      `Completed initialization of the ${chalk.bold.cyanBright(name)} Vite plugin`
    );

    return result;
  };
}
