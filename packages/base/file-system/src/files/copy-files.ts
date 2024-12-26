/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { StormError } from "@storm-stack/errors";
import { constants, copyFileSync, cpSync, type CopySyncOptions } from "node:fs";
import { FileSystemErrorCode } from "../errors";

/**
 * Copy files from one location to another
 *
 * @param from - The source location
 * @param to - The destination location
 * @param options - The copy options
 * @returns An indicator specifying if the copy was successful
 */
export const copyFiles = (
  from: string,
  to: string,
  options?: CopySyncOptions
) => {
  try {
    cpSync(from, to, options);
  } catch (error_) {
    throw StormError.createException(FileSystemErrorCode.file_copy_failure, {
      message: "A file copy error occurred",
      cause: error_
    });
  }
};

/**
 * Copy a file from one location to another
 *
 * @param file - The file to copy
 * @param to - The destination location
 * @returns An indicator specifying if the copy was successful
 */
export const copyFile = (file: string, to: string) => {
  try {
    copyFileSync(file, to, constants.COPYFILE_FICLONE);
  } catch (error_) {
    throw StormError.createException(FileSystemErrorCode.file_copy_failure, {
      message: "A file copy error occurred",
      cause: error_
    });
  }
};
