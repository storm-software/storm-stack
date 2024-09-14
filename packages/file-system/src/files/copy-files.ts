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

import { constants, copyFileSync, cpSync, type CopySyncOptions } from "node:fs";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StormLog } from "@storm-stack/logging";

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
): string | Buffer | undefined => {
  try {
    StormLog.info(`Copying files from "${from}" to "${to}"`);
    cpSync(from, to, options);

    return undefined;
  } catch (error_) {
    StormLog.error("An error occurred copying files");
    StormLog.error(error_);

    return (
      (error_ as any)?.message ?? "Exception occurred while processing request "
    );
  }
};

/**
 * Copy a file from one location to another
 *
 * @param file - The file to copy
 * @param dest - The destination location
 * @returns An indicator specifying if the copy was successful
 */
export const copyFile = (
  file: string,
  dest: string
): string | Buffer | undefined => {
  try {
    StormLog.info(`Copying file "${file}" to "${dest}"`);

    copyFileSync(file, dest, constants.COPYFILE_FICLONE);

    return undefined;
  } catch (error_) {
    StormLog.error("An error occurred copying files");
    StormLog.error(error_);

    return (
      (error_ as any)?.message ?? "Exception occurred while processing request "
    );
  }
};
