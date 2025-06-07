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

import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context, Options } from "../../../types/build";

export function writeStorage<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `
/**
 * The storage module provides a unified storage interface for the Storm Stack runtime.
 *
 * @module storm:storage
 */

${getFileHeader()}

import { createStorage } from "unstorage";
${context.runtime.storage
  .map(storage => storage.import)
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
