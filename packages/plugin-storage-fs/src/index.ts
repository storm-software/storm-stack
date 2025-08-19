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
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import type { StoragePluginOptions } from "@storm-stack/devkit/plugins/storage";
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import { StormEnvPathType } from "@storm-stack/types/node/env";
import type { FSStorageOptions } from "unstorage/drivers/fs-lite";

export type StorageFileSystemPluginConfig = FSStorageOptions &
  StoragePluginOptions & {
    /**
     * The environment path to use for the storage.
     *
     * @remarks
     * These environment paths are returned using the \`\@stryke/env\` package.
     */
    envPath?: StormEnvPathType;
  };

export default class StorageFileSystemPlugin extends StoragePlugin<StorageFileSystemPluginConfig> {
  public constructor(options: PluginOptions<StorageFileSystemPluginConfig>) {
    super(options);
  }

  protected override writeStorage() {
    return `${getFileHeader()}

import fsLiteDriver from "unstorage/drivers/fs-lite";${
      this.options.envPath
        ? `
import { join } from "node:path";`
        : ""
    }
import type { StorageAdapter } from "@storm-stack/types/shared/storage";

function createAdapter(): StorageAdapter {
  const adapter = fsLiteDriver({ base: ${
    this.options.envPath
      ? this.options.base
        ? `join($storm.env.paths.${this.options.envPath}, "${this.options.base}")`
        : `$storm.env.paths.${this.options.envPath}`
      : this.options.base
        ? `"${this.options.base}"`
        : "undefined"
  }, readOnly: ${Boolean(this.options.readOnly)}, noClear: ${Boolean(
    this.options.noClear
  )} }) as StorageAdapter;
  adapter[Symbol.asyncDispose] = async () => {
    if (adapter.dispose && typeof adapter.dispose === "function") {
      await Promise.resolve(adapter.dispose());
    }
  };

  return adapter;
}

export default createAdapter;

`;
  }
}
