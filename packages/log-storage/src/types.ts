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

import type { LogRecord } from "@storm-stack/types/log";
import type { Storage, StorageValue } from "unstorage";

export type StorageFormatter<T extends StorageValue = StorageValue> = (
  record: LogRecord
) => T;

export interface StorageSinkOptions<T extends StorageValue = StorageValue> {
  /**
   * The text formatter to use.  Defaults to {@link defaultTextFormatter}.
   */
  formatter?: StorageFormatter<T>;

  /**
   * The [unstorage](https://unstorage.unjs.io/) storage to use. Defaults to `localStorage` in the browser and `fs` in Node.js.
   */
  storage: Storage<T>;
}

/**
 * A platform-specific file sink driver.
 */
export interface FileSinkDriver<TFile> {
  /**
   * Open a file for appending and return a file descriptor.
   * @param path A path to the file to open.
   */
  openSync: (path: string) => TFile;

  /**
   * Write a chunk of data to the file.
   * @param fd The file descriptor.
   * @param chunk The data to write.
   */
  writeSync: (fd: TFile, chunk: Uint8Array) => void;

  /**
   * Flush the file to ensure that all data is written to the disk.
   * @param fd The file descriptor.
   */
  flushSync: (fd: TFile) => void;

  /**
   * Close the file.
   * @param fd The file descriptor.
   */
  closeSync: (fd: TFile) => void;
}

/**
 * Options for the {@link getRotatingSink} function.
 */
export interface RotatingStorageSinkOptions extends StorageSinkOptions {
  /**
   * The maximum bytes of the file before it is rotated.  1 MiB by default.
   */
  maxSize?: number;

  /**
   * The maximum number of files to keep.  5 by default.
   */
  maxFiles?: number;
}

/**
 * A platform-specific rotating file sink driver.
 */
export interface RotatingFileSinkDriver<TFile> extends FileSinkDriver<TFile> {
  /**
   * Get the size of the file.
   * @param path A path to the file.
   * @returns The `size` of the file in bytes, in an object.
   */
  statSync: (path: string) => { size: number };

  /**
   * Rename a file.
   * @param oldPath A path to the file to rename.
   * @param newPath A path to be renamed to.
   */
  renameSync: (oldPath: string, newPath: string) => void;
}
