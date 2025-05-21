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

import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { Options } from "@storm-stack/core/types";
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

export default class StorageFileSystemPlugin<
  TOptions extends Options = Options
> extends StoragePlugin<TOptions> {
  public constructor(protected override config: StorageFileSystemPluginConfig) {
    super(config, "storage-fs-plugin", "@storm-stack/plugin-storage-fs");
  }

  protected override writeStorage() {
    return `${getFileHeader()}

import fsLiteDriver from "unstorage/drivers/fs-lite";${
      this.config.envPath
        ? `
import { join } from "node:path";
import { getEnvPaths } from "../env";`
        : ""
    }

export default fsLiteDriver({ base: ${
      this.config.envPath
        ? this.config.base
          ? `join(getEnvPaths().${this.config.envPath}, "${this.config.base}")`
          : `getEnvPaths().${this.config.envPath}`
        : this.config.base
          ? `"${this.config.base}"`
          : "undefined"
    }, readOnly: ${Boolean(this.config.readOnly)}, noClear: ${Boolean(this.config.noClear)} });
`;
  }
}
