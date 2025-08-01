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

import { PluginAPI, PluginObject, PluginPass } from "@babel/core";
import { declare } from "@babel/helper-plugin-utils";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { deserializeContext } from "@storm-stack/core/lib/context";
import { createLog, extendLog } from "@storm-stack/core/lib/logger";
import {
  BabelPluginOptions,
  BabelPluginState
} from "@storm-stack/core/types/babel";
import { BabelPluginBuilder } from "../types";

export interface DeclareBabelReturn<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
> {
  (
    api: PluginAPI,
    options: TOptions,
    dirname: string
  ): PluginObject<TState & PluginPass<object>>;
  name: string;
}

/**
 * Declare a Babel plugin using the provided builder function.
 *
 * @param name - The name of the plugin.
 * @param builder - The builder function that defines the plugin behavior.
 * @returns A Babel plugin declaration.
 */
export function declareBabel<
  TOptions extends BabelPluginOptions = BabelPluginOptions,
  TState extends BabelPluginState<TOptions> = BabelPluginState<TOptions>
>(
  name: string,
  builder: BabelPluginBuilder<TOptions, TState>
): DeclareBabelReturn<TOptions, TState> {
  const result = declare<TState, TOptions>((api, options, dirname) => {
    api.cache.using(() => options.context.meta.checksum);
    api.env(options.context.options.environment);

    const state = {
      options,
      context: deserializeContext(options.context, "babel-plugin")
    } as TState;

    state.context.log = createLog("babel-plugin", {
      logLevel: state.context.options.logLevel
    });

    const log = extendLog(state.context.log, name);
    log(LogLevelLabel.TRACE, `Initializing Babel plugin - ${dirname}`);

    return {
      ...builder({
        log,
        name,
        api,
        options,
        state,
        dirname
      }),
      name: `storm-stack:${name}`
    };
  }) as DeclareBabelReturn<TOptions, TState>;
  result.name ??= name;

  return result;
}
