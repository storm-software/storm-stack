/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { ErrorType } from "@storm-stack/types/shared/error";
import { readFile, writeFile } from "node:fs/promises";
import { format, resolveConfig } from "prettier";

/**
 * Gets the latest error code for a given type.
 *
 * @param type - The type of error codes to retrieve (default is "general").
 * @param errorCodes - An object containing error codes categorized by type.
 * @returns The next available error code as a string.
 */
function getLatestErrorCode(
  type = "general",
  errorCodes = {} as Record<ErrorType, Record<string, string>>
): string {
  if (!errorCodes[type]) {
    return "1";
  }
  const keys = Object.keys(errorCodes[type]);
  if (keys.length === 0) {
    return "1";
  }

  const errorCode = Number.parseInt(
    keys.sort((a, b) => Number.parseInt(b) - Number.parseInt(a))[0]!
  );
  if (Number.isNaN(errorCode)) {
    return "1";
  }

  return String(errorCode + 1);
}

/**
 * Interface representing the data required to error lookup codes.
 */
export interface ErrorLookupData {
  /**
   * The error messages to commit
   */
  message: string;

  /**
   * The error type to commit the error messages to.
   */
  type: ErrorType;

  /**
   * The file path where the error codes should be committed.
   */
  filePath: string;
}

/**
 * Commits the error codes to the specified file path.
 *
 * @param data - The data containing errors and file path.
 * @returns A promise that resolves when the commit is complete.
 */
export async function find(data: ErrorLookupData): Promise<string> {
  if (!data.filePath) {
    throw new Error(
      "Error Code file path is required to run the error-lookup worker."
    );
  }

  const errorCodesFile = await readFile(data.filePath, "utf8");
  if (!errorCodesFile) {
    throw new Error(`Error codes file not found at ${data.filePath}`);
  }

  const errorCodes = JSON.parse(errorCodesFile);

  errorCodes[data.type] ??= {};
  let code = Object.keys(errorCodes[data.type] ?? {}).find(
    key => errorCodes[data.type]?.[key] === data.message
  );
  if (code) {
    return code;
  }

  code = getLatestErrorCode(data.type, errorCodes);
  errorCodes[data.type][code] = data.message;

  const config = await resolveConfig(data.filePath);
  const formatted = await format(JSON.stringify(errorCodes), {
    ...(config ?? {}),
    filepath: data.filePath
  });

  await writeFile(data.filePath, formatted, "utf8");

  return code;
}
