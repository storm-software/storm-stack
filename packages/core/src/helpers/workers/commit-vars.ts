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

import {
  deserializeType,
  merge,
  resolveClassType,
  SerializedTypes,
  serializeType
} from "@deepkit/type";
import { existsSync } from "@stryke/path/exists";
import { readFile, writeFile } from "node:fs/promises";
import { format, resolveConfig } from "prettier";

export interface CommitVarsData {
  /**
   * The variables to commit.
   */
  vars: SerializedTypes;

  /**
   * The file path where the variables should be committed.
   */
  filePath: string;
}

/**
 * Commits the variables to the specified file path.
 *
 * @param data - The data containing variables and file path.
 * @returns A promise that resolves when the commit is complete.
 */
export async function commit(data: CommitVarsData): Promise<void> {
  if (!data.filePath) {
    throw new Error(
      "The variables reflection file path is required to run the commit-vars worker."
    );
  }

  let varsType = resolveClassType(deserializeType(data.vars)).type;
  if (existsSync(data.filePath)) {
    const existingReflection = resolveClassType(
      deserializeType(JSON.parse(await readFile(data.filePath, "utf8")))
    );

    varsType = merge([existingReflection.type, varsType]);
  }

  const config = await resolveConfig(data.filePath);
  const formatted = await format(JSON.stringify(serializeType(varsType)), {
    ...(config ?? {}),
    filepath: data.filePath
  });

  await writeFile(data.filePath, formatted, "utf8");
}
