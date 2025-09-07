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
import { camelCase } from "@stryke/string-format/camel-case";
import { pascalCase } from "@stryke/string-format/pascal-case";

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

import { createStorage as createUnstorage } from "unstorage";
import { StormStorageInterface } from "@storm-stack/core/runtime-types/shared/storage";
${context.runtime.storage
  .map(
    storage =>
      `import create${pascalCase(storage.namespace)}StorageAdapter from "storm:${storage.fileName}";`
  )
  .filter(Boolean)
  .join("\n")}


/**
 * Creates a new storage instance.
 *
 * @remarks
 * This function initializes the storage with all configured adapters.
 *
 * @returns The {@link StormStorageInterface} storage instance with each storage adapter loaded into a slice of it's total state.
 */
export function createStorage(): StormStorageInterface {
  const storage = createUnstorage() as StormStorageInterface;

  ${context.runtime.storage
    .map(storage => {
      return `
  // Initialize the ${storage.namespace} storage adapter
  const ${camelCase(storage.namespace)}StorageAdapter = create${pascalCase(storage.namespace)}StorageAdapter();
  storage.mount("${storage.namespace}", ${camelCase(storage.namespace)}StorageAdapter);
`;
    })
    .join("\n")}


  storage[Symbol.asyncDispose] = async () => {
    await storage.dispose();
  };

  return storage;
}

`;
}
