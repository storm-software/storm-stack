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

import type { LogLevel, LogRecord, LogSink } from "storm-stack/types";
import { defaultConsoleFormatter } from "./formatter";
import type { ConsoleSinkOptions } from "./types";

/**
 * A console sink factory that returns a sink that logs to the console.
 *
 * @param options - The options for the sink.
 * @returns A sink that logs to the console.
 */
export function getSink(options: ConsoleSinkOptions = {}): LogSink {
  const formatter = options.formatter ?? defaultConsoleFormatter;
  const console = options.console ?? (globalThis as any).console;

  function writeConsoleLog(level: LogLevel, ...message: unknown[]) {
    switch (level) {
      case "fatal":
      case "error":
        // eslint-disable-next-line ts/no-unsafe-call
        console.error(...message);
        break;
      case "warning":
        // eslint-disable-next-line ts/no-unsafe-call
        console.warn(...message);
        break;
      case "info":
        // eslint-disable-next-line ts/no-unsafe-call
        console.info(...message);
        break;
      case "debug":
        // eslint-disable-next-line ts/no-unsafe-call
        console.debug(...message);
        break;
      default:
        // eslint-disable-next-line ts/no-unsafe-call
        console.log(...message);
    }
  }

  return (record: LogRecord) => {
    const args = formatter(record);
    if (typeof args === "string") {
      const msg = args.replace(/\r?\n$/, "");
      writeConsoleLog(record.level, msg);
    } else {
      writeConsoleLog(record.level, ...args);
    }
  };
}
