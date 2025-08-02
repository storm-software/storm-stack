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

import { Context } from "@storm-stack/core/types/context";
import { PluginBaseConfig } from "@storm-stack/core/types/plugin";
import {
  DotenvPluginConfig,
  ResolvedDotenvOptions
} from "@storm-stack/plugin-dotenv/types";

export type DateLibraryType = "date-fns" | "dayjs" | "luxon" | "moment";

export interface DatePluginConfig extends PluginBaseConfig {
  /**
   * The type of date library to use
   *
   * @remarks
   * This value is used to determine which date library to use for date manipulation. It can be one of the following:
   * - [date-fns](https://date-fns.org/)
   * - [dayjs](https://day.js.org/)
   * - [luxon](https://moment.github.io/luxon/)
   * - [moment](https://momentjs.com/).
   *
   * @defaultValue "date-fns"
   */
  type?: DateLibraryType;

  /**
   * Options for the dotenv plugin.
   */
  dotenv?: DotenvPluginConfig;
}

export type ResolvedDateOptions = Required<Omit<DatePluginConfig, "dotenv">>;

export interface DatePluginContextOptions {
  date: Required<Omit<DatePluginConfig, "dotenv">>;
  dotenv: ResolvedDotenvOptions;
}

export type DatePluginContext = Context<DatePluginContextOptions>;
