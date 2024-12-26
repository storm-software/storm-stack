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
import { StormParser } from "@storm-stack/serialization/storm-parser";
import { writeFile as writeFileFs, writeFileSync } from "node:fs";
import { promisify } from "node:util";
import { FileSystemErrorCode } from "../errors";

/**
 * Write the given content to the given file path
 *
 * @param filePath - The file path to write to
 * @param content - The content to write to the file
 */
export const writeFile = (filePath: string, content: any): void => {
  try {
    if (!filePath) {
      throw StormError.createException(FileSystemErrorCode.invalid_file_path, {
        message: "No file path provided to write data"
      });
    }
    if (!content) {
      throw StormError.createException(
        FileSystemErrorCode.invalid_file_content,
        {
          message: "No content provided to write to file"
        }
      );
    }

    writeFileSync(filePath, StormParser.stringify(content));
  } catch (error_) {
    throw StormError.createException(FileSystemErrorCode.file_write_failure, {
      message: "An error occurred writing data to file",
      cause: error_
    });
  }
};

/**
 * Read the given content to the given file path
 *
 * @param filePath - The file path to read to
 */
export const writeFileAsync = (
  filePath: string,
  content: any
): Promise<void> => {
  try {
    if (!filePath) {
      throw StormError.createException(FileSystemErrorCode.invalid_file_path, {
        message: "No file path provided to read data"
      });
    }

    return promisify(writeFileFs)(filePath, content);
  } catch (error_) {
    throw StormError.createException(FileSystemErrorCode.file_write_failure, {
      message: "An error occurred writing data to file",
      cause: error_
    });
  }
};
