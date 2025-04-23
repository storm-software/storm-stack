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

import { defaultTextFormatter } from "@storm-stack/log-stream/formatter";
import type { LogRecord, LogSink } from "@storm-stack/types/log";
import type { StorageValue } from "unstorage";
import type { StorageSinkOptions } from "./types";

/**
 * Get a file sink.
 *
 * Note that this function is unavailable in the browser.
 *
 * @param path - A path to the file to write to.
 * @param options - The options for the sink.
 * @returns A sink that writes to the file.  The sink is also a disposable
 *          object that closes the file when disposed.
 */
export async function getSink<T extends StorageValue = StorageValue>(
  options: StorageSinkOptions<T>
): Promise<LogSink & AsyncDisposable> {
  const formatter = options.formatter ?? defaultTextFormatter;
  const storage = options.storage;

  const sink: LogSink & AsyncDisposable = (record: LogRecord) => {
    void storage.setItem(
      `logs:storm-${new Date().toISOString().replace("T", "_").replace("Z", "")}.log`,
      formatter(record) as T
    );
  };

  sink[Symbol.asyncDispose] = async () => storage.dispose();
  return sink;
}

/**
 * Get a rotating file sink.
 *
 * This sink writes log records to a file, and rotates the file when it reaches
 * the `maxSize`. The rotated files are named with the original file name
 * followed by a dot and a number, starting from 1. The number is incremented
 * for each rotation, and the maximum number of files to keep is `maxFiles`.
 *
 * Note that this function is unavailable in the browser.
 *
 * @param path - A path to the file to write to.
 * @param options - The options for the sink and the file driver.
 * @returns A sink that writes to the file. The sink is also a disposable object that closes the file when disposed.
 */
// export function getRotatingSink(
//   path: string,
//   options: RotatingStorageSinkOptions = {}
// ): LogSink & Disposable {
//   return getBaseRotatingFileSink(path, { ...options, ...nodeDriver });
// }
