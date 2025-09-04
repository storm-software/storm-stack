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

import { ResolvedOptions } from "@storm-stack/core/types/build";
import { Context } from "@storm-stack/core/types/context";
import { LogPluginOptions } from "@storm-stack/devkit/types/plugins";
import type { LogRecord } from "@storm-stack/types/shared/log";

/**
 * A console formatter is a function that accepts a log record and returns an array of arguments to pass to {@link console.log}.
 *
 * @param record - The log record to format.
 * @returns The formatted log record, as an array of arguments for {@link console.log}.
 */
export type ConsoleFormatter = (record: LogRecord) => readonly any[] | string;

/**
 * Options for the {@link getAdapter} function.
 */
export interface ConsoleAdapterOptions {
  /**
   * The console formatter or text formatter to use.
   *
   * @defaultValue {@link defaultConsoleFormatter}.
   */
  formatter?: ConsoleFormatter;

  /**
   * The console to log to.
   *
   * @defaultValue {@link console}.
   */
  console?: Console;
}

export interface LogConsolePluginOptions extends LogPluginOptions {
  /**
   * The prefix to add to log messages.
   */
  prefix?: string;
}

export type LogConsolePluginResolvedOptions =
  ResolvedOptions<LogConsolePluginOptions>;

export type LogConsolePluginContext<
  TOptions extends LogConsolePluginOptions = LogConsolePluginOptions
> = Context<ResolvedOptions<TOptions>>;
