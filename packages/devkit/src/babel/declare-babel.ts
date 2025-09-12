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

import { declare } from "@babel/helper-plugin-utils";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { extendLog } from "@storm-stack/core/lib/logger";
import { BabelPluginOptions } from "@storm-stack/core/types/babel";
import { Context } from "@storm-stack/core/types/context";
import chalk from "chalk";
import { BabelPluginBuilder, DeclareBabelPluginReturn } from "../types/babel";

/**
 * Declare a Babel plugin using the provided builder function.
 *
 * @param name - The name of the plugin.
 * @param builder - The builder function that defines the plugin behavior.
 * @returns A Babel plugin declaration.
 */
export function declareBabel<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TContext extends Context = Context,
  TState = any
>(
  name: string,
  builder: BabelPluginBuilder<TOptions, TContext>
): DeclareBabelPluginReturn<TOptions, TContext> {
  const plugin = (context: TContext) => {
    return declare<TState, TOptions>((api, options, dirname) => {
      api.cache.using(() => context.meta.checksum);
      api.assertVersion("^8.0.0-0");

      const log = extendLog(context.log, name);
      log(
        LogLevelLabel.TRACE,
        `Initializing the ${chalk.bold.cyanBright(name)} Babel plugin`
      );

      const result = builder({
        log,
        name,
        api,
        options,
        context,
        dirname
      });
      result.name = name;

      log(
        LogLevelLabel.TRACE,
        `Completed initialization of the ${chalk.bold.cyanBright(name)} Babel plugin`
      );

      return result;
    });
  };
  plugin._name = name;

  return plugin;
}
