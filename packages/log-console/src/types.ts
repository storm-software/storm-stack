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

import type { LogRecord } from "storm-stack/types";

/**
 * A console formatter is a function that accepts a log record and returns an array of arguments to pass to {@link console.log}.
 *
 * @param record - The log record to format.
 * @returns The formatted log record, as an array of arguments for {@link console.log}.
 */
export type ConsoleFormatter = (record: LogRecord) => readonly any[];

/**
 * Options for the {@link getConsoleSink} function.
 */
export interface ConsoleSinkOptions {
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
