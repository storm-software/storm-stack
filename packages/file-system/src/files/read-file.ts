import { StormError } from "@storm-stack/errors";
import { readFile as readFileFs, readFileSync } from "node:fs";
import { promisify } from "node:util";
import { FileSystemErrorCode } from "../errors";

/**
 * Read the given content to the given file path
 *
 * @param filePath - The file path to write to
 */
export const readFile = (filePath: string): string => {
  try {
    if (!filePath) {
      throw new StormError(FileSystemErrorCode.invalid_file_path, {
        message: "No file path provided to read data"
      });
    }

    return readFileSync(filePath, { encoding: "utf8" });
  } catch (error_) {
    throw new StormError(FileSystemErrorCode.file_write_failure, {
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
export const readFileAsync = (filePath: string): Promise<string> => {
  try {
    if (!filePath) {
      throw new StormError(FileSystemErrorCode.invalid_file_path, {
        message: "No file path provided to read data"
      });
    }

    return promisify(readFileFs)(filePath, { encoding: "utf8" });
  } catch (error_) {
    throw new StormError(FileSystemErrorCode.file_write_failure, {
      message: "An error occurred writing data to file",
      cause: error_
    });
  }
};
