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

import fs from "node:fs";
import type { LogSink } from "storm-stack/types";
import { getBaseFileSink, getBaseRotatingFileSink } from "./base/base-sink";
import type {
  FileSinkOptions,
  RotatingFileSinkDriver,
  RotatingFileSinkOptions
} from "./types";

/**
 * A Node.js-specific file sink driver.
 */
export const nodeDriver: RotatingFileSinkDriver<number> = {
  openSync(path: string) {
    return fs.openSync(path, "a");
  },
  writeSync: fs.writeSync,
  flushSync: fs.fsyncSync,
  closeSync: fs.closeSync,
  statSync: fs.statSync,
  renameSync: fs.renameSync
};

/**
 * Get a file sink.
 *
 * Note that this function is unavailable in the browser.
 *
 * @param path A path to the file to write to.
 * @param options The options for the sink.
 * @returns A sink that writes to the file.  The sink is also a disposable
 *          object that closes the file when disposed.
 */
export function getSink(
  path: string,
  options: FileSinkOptions = {}
): LogSink & Disposable {
  return getBaseFileSink(path, { ...options, ...nodeDriver });
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
export function getRotatingSink(
  path: string,
  options: RotatingFileSinkOptions = {}
): LogSink & Disposable {
  return getBaseRotatingFileSink(path, { ...options, ...nodeDriver });
}
