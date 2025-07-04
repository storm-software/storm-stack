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

import { PluginOptions } from "@storm-stack/core/base/plugin";
import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { StoragePluginConfig } from "@storm-stack/devkit/plugins/storage";
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import type { FSStorageOptions } from "unstorage/drivers/fs-lite";

export type StorageFileSystemPluginConfig = FSStorageOptions &
  StoragePluginConfig & {
    /**
     * The environment path to use for the storage.
     *
     * @remarks
     * These environment paths are returned using the \`\@stryke/env\` package.
     */
    envPath?: "data" | "config" | "cache" | "log" | "temp";
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
import { join } from "node:path";
import { paths } from "../env";`
        : ""
    }

export default fsLiteDriver({ base: ${
      this.options.envPath
        ? this.options.base
          ? `join(paths.${this.options.envPath}, "${this.options.base}")`
          : `paths.${this.options.envPath}`
        : this.options.base
          ? `"${this.options.base}"`
          : "undefined"
    }, readOnly: ${Boolean(this.options.readOnly)}, noClear: ${Boolean(this.options.noClear)} });
`;
  }
}
