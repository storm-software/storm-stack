/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import type { Context } from "@storm-stack/core/types/context";

/**
 * The storage module provides a unified storage interface for the Storm Stack runtime.
 *
 * @param context - The context of the Storm Stack runtime, which includes storage configurations.
 * @returns A string representing the storage module code.
 */
export function StorageModule(context: Context) {
  return `
/**
 * The storage module provides a unified storage interface for the Storm Stack runtime.
 *
 * @module storm:storage
 */

${getFileHeader()}

import { createStorage } from "unstorage";
${context.runtime.storage
  .map(storage => `import ${storage.name} from "storm:${storage.fileName}";`)
  .filter(Boolean)
  .join("\n")}

export const storage = createStorage();

${context.runtime.storage
  .map(storage => {
    return `storage.mount("${storage.namespace}", ${storage.name});`;
  })
  .join("\n")}
`;
}
