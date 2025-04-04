/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import { writeFile as writeFileBase } from "@stryke/fs/write-file";
import { format, resolveConfig } from "prettier";

/**
 * Writes and formats a file to the file system
 *
 * @param filepath - The file path to write the file
 * @param content - The content to write to the file
 * @param skipFormat - Should the plugin skip formatting the `content` string with Prettier
 */
export async function writeFile(
  filepath: string,
  content: string,
  skipFormat = false
) {
  if (skipFormat) {
    return writeFileBase(filepath, content);
  }

  const config = (await resolveConfig(filepath)) ?? {};
  await writeFileBase(
    filepath,
    await format(content, {
      ...config,
      filepath
    })
  );
}
