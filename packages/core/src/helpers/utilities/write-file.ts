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
import { writeFile as writeFileBase } from "@stryke/fs/write-file";
import { format, resolveConfig } from "prettier";
import type { LogFn } from "../../types/config";

/**
 * Writes and formats a file to the file system
 *
 * @param log - The logger function to use
 * @param filepath - The file path to write the file
 * @param content - The content to write to the file
 * @param skipFormat - Should the plugin skip formatting the `content` string with Prettier
 */
export async function writeFile(
  log: LogFn,
  filepath: string,
  content: string,
  skipFormat = false
) {
  try {
    if (skipFormat) {
      await writeFileBase(filepath, content);
    } else {
      const config = await resolveConfig(filepath);
      const formatted = await format(content, {
        ...(config ?? {}),
        filepath
      });

      await writeFileBase(filepath, formatted || "");
    }
  } catch (error) {
    log(
      LogLevelLabel.ERROR,
      `Failed to write file ${filepath} to disk \n${(error as Error)?.message ? (error as Error).message : ""}`
    );
  }
}
