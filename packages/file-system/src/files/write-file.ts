import { writeFile as writeFileFs, writeFileSync } from "node:fs";
import { promisify } from "node:util";
import { StormError } from "@storm-stack/errors";
import { StormParser } from "@storm-stack/serialization";
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
      throw new StormError(FileSystemErrorCode.invalid_file_path, {
        message: "No file path provided to write data"
      });
    }
    if (!content) {
      throw new StormError(FileSystemErrorCode.invalid_file_content, {
        message: "No content provided to write to file"
      });
    }

    writeFileSync(filePath, StormParser.stringify(content));
  } catch (e) {
    throw new StormError(FileSystemErrorCode.file_write_failure, {
      message: "An error occurred writing data to file",
      cause: e
    });
  }
};

/**
 * Read the given content to the given file path
 *
 * @param filePath - The file path to read to
 */
export const writeFileAsync = (filePath: string, content: any): Promise<void> => {
  try {
    if (!filePath) {
      throw new StormError(FileSystemErrorCode.invalid_file_path, {
        message: "No file path provided to read data"
      });
    }

    return promisify(writeFileFs)(filePath, content);
  } catch (e) {
    throw new StormError(FileSystemErrorCode.file_write_failure, {
      message: "An error occurred writing data to file",
      cause: e
    });
  }
};
