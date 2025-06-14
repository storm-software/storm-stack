#!/usr/bin/env -S NODE_OPTIONS=--enable-source-maps node
/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { ErrorType } from "@storm-stack/types/shared/error";
import { readJsonFile, writeJsonFile } from "@stryke/fs/json";
import { writeFile } from "@stryke/fs/write-file";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "node:fs";
import { format, resolveConfig } from "prettier";
import { createLog } from "../../../helpers/utilities/logger";

const log = createLog("worker:error-message");

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
 * Interface representing the data required to commit variables.
 */
export interface FindPayload {
  /**
   * The error message text to commit.
   */
  text: string;

  /**
   * The type of error to commit the error messages to.
   */
  type: ErrorType;

  /**
   * The file path where the variables should be committed.
   */
  path: string;
}

/**
 * Update the variable to the specified file path.
 *
 * @param payload - The data containing variables and file path.
 * @returns A promise that resolves when the commit is complete.
 */
export async function find(payload: FindPayload): Promise<string> {
  if (!payload.path) {
    throw new Error(
      "The variables reflection file path is required to run the commit-vars worker."
    );
  }

  let errorCodes = {} as Record<ErrorType, Record<string, string>>;
  if (existsSync(payload.path)) {
    errorCodes = await readJsonFile<Record<ErrorType, Record<string, string>>>(
      payload.path
    );
  } else {
    await writeJsonFile(payload.path, {});
  }

  errorCodes[payload.type] ??= {};
  let code = Object.keys(errorCodes[payload.type] ?? {}).find(
    key => errorCodes[payload.type]?.[key] === payload.text
  );
  if (!code) {
    code = getLatestErrorCode(payload.type, errorCodes);
    errorCodes[payload.type][code] = payload.text;

    log(
      LogLevelLabel.TRACE,
      `Adding error code ${code} for type ${payload.type} with message: ${payload.text}`
    );

    const config = await resolveConfig(payload.path);
    const formatted = await format(StormJSON.stringify(errorCodes), {
      ...(config ?? {}),
      filepath: payload.path
    });

    await writeFile(payload.path, formatted);
  }

  return code;
}
