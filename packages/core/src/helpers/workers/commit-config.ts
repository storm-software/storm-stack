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

/**
 * Interface representing the data required to commit config.
 */
export interface CommitConfigData {
  /**
   * The config to commit.
   */
  config: SerializedTypes;

  /**
   * The file path where the config should be committed.
   */
  filePath: string;
}

/**
 * Commits the config to the specified file path.
 *
 * @param data - The data containing config and file path.
 * @returns A promise that resolves when the commit is complete.
 */
export async function commit(data: CommitConfigData): Promise<void> {
  if (!data.filePath) {
    throw new Error(
      "The config reflection file path is required to run the commit-config worker."
    );
  }

  let configType = resolveClassType(deserializeType(data.config)).type;
  if (existsSync(data.filePath)) {
    const existingReflection = resolveClassType(
      deserializeType(JSON.parse(await readFile(data.filePath, "utf8")))
    );

    configType = merge([existingReflection.type, configType]);
  }

  const config = await resolveConfig(data.filePath);
  const formatted = await format(JSON.stringify(serializeType(configType)), {
    ...(config ?? {}),
    filepath: data.filePath
  });

  await writeFile(data.filePath, formatted, "utf8");
}
