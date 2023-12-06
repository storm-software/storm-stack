/* eslint-disable @typescript-eslint/no-explicit-any */
import { StormLog } from "@storm-stack/logging";
import fs, { CopySyncOptions, copyFileSync, cpSync } from "node:fs";

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
  } catch (e) {
    StormLog.error(`An error occurred copying files`);
    StormLog.error(e);

    return (
      (e as any)?.message ?? "Exception occurred while processing request "
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

    copyFileSync(file, dest, fs.constants.COPYFILE_FICLONE);

    return undefined;
  } catch (e) {
    StormLog.error(`An error occurred copying files`);
    StormLog.error(e);

    return (
      (e as any)?.message ?? "Exception occurred while processing request "
    );
  }
};
