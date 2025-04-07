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

import type { LogRecord, LogSink } from "@storm-stack/core/types";
import { defaultTextFormatter } from "@storm-stack/log-stream/formatter";
import type {
  FileSinkDriver,
  FileSinkOptions,
  RotatingFileSinkDriver,
  RotatingFileSinkOptions
} from "../types";

/**
 * Get a platform-independent file sink.
 *
 * @param path - A path to the file to write to.
 * @param options - The options for the sink and the file driver.
 * @returns A sink that writes to the file. The sink is also a disposable object that closes the file when disposed.
 */
export function getBaseFileSink<TFile>(
  path: string,
  options: FileSinkOptions & FileSinkDriver<TFile>
): LogSink & Disposable {
  const formatter = options.formatter ?? defaultTextFormatter;
  const encoder = options.encoder ?? new TextEncoder();
  const fd = options.openSync(path);
  const sink: LogSink & Disposable = (record: LogRecord) => {
    options.writeSync(fd, encoder.encode(formatter(record)));
    options.flushSync(fd);
  };
  sink[Symbol.dispose] = () => options.closeSync(fd);
  return sink;
}

/**
 * Get a platform-independent rotating file sink.
 *
 * This sink writes log records to a file, and rotates the file when it reaches
 * the `maxSize`.  The rotated files are named with the original file name
 * followed by a dot and a number, starting from 1.  The number is incremented
 * for each rotation, and the maximum number of files to keep is `maxFiles`.
 *
 * @param path - A path to the file to write to.
 * @param options - The options for the sink and the file driver.
 * @returns A sink that writes to the file.  The sink is also a disposable
 *          object that closes the file when disposed.
 */
export function getBaseRotatingFileSink<TFile>(
  path: string,
  options: RotatingFileSinkOptions & RotatingFileSinkDriver<TFile>
): LogSink & Disposable {
  const formatter = options.formatter ?? defaultTextFormatter;
  const encoder = options.encoder ?? new TextEncoder();
  const maxSize = options.maxSize ?? 1024 * 1024;
  const maxFiles = options.maxFiles ?? 5;
  let offset: number = 0;
  try {
    const stat = options.statSync(path);
    offset = stat.size;
  } catch {
    // Continue as the offset is already 0.
  }
  let fd = options.openSync(path);
  function shouldRollover(bytes: Uint8Array): boolean {
    return offset + bytes.length > maxSize;
  }
  function performRollover(): void {
    options.closeSync(fd);
    for (let i = maxFiles - 1; i > 0; i--) {
      const oldPath = `${path}.${i}`;
      const newPath = `${path}.${i + 1}`;
      try {
        options.renameSync(oldPath, newPath);

        // eslint-disable-next-line unused-imports/no-unused-vars, ts/no-unused-vars
      } catch (_) {
        // Do nothing if the file does not exist
      }
    }
    options.renameSync(path, `${path}.1`);
    offset = 0;
    fd = options.openSync(path);
  }
  const sink: LogSink & Disposable = (record: LogRecord) => {
    const bytes = encoder.encode(formatter(record));
    if (shouldRollover(bytes)) performRollover();
    options.writeSync(fd, bytes);
    options.flushSync(fd);
    offset += bytes.length;
  };
  sink[Symbol.dispose] = () => options.closeSync(fd);
  return sink;
}
