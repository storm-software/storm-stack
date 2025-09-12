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
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import {
  StorageFileSystemPluginContext,
  StorageFileSystemPluginOptions
} from "./types";

export default class StorageFileSystemPlugin<
  TContext extends
    StorageFileSystemPluginContext = StorageFileSystemPluginContext,
  TOptions extends
    StorageFileSystemPluginOptions = StorageFileSystemPluginOptions
> extends StoragePlugin<TContext, TOptions> {
  public constructor(options: PluginOptions<TOptions>) {
    super(options);
  }

  /**
   * Writes the storage configuration to a file.
   *
   * @param context - The plugin context.
   * @returns The storage configuration as a string.
   */
  protected override writeStorage(context: TContext) {
    return `${getFileHeader()}

import fsLiteDriver from "unstorage/drivers/fs-lite";${
      this.getOptions(context).envPath
        ? `
import { join } from "node:path";`
        : ""
    }
import type { StorageAdapter } from "@storm-stack/core/runtime-types/shared/storage";

function createAdapter(): StorageAdapter {
  const adapter = fsLiteDriver({ base: ${
    this.getOptions(context).envPath
      ? this.getOptions(context).base
        ? `join($storm.meta.paths.${this.getOptions(context).envPath}, "${this.getOptions(context).base}")`
        : `$storm.meta.paths.${this.getOptions(context).envPath}`
      : this.getOptions(context).base
        ? `"${this.getOptions(context).base}"`
        : "undefined"
  }, readOnly: ${Boolean(this.getOptions(context).readOnly)}, noClear: ${Boolean(
    this.getOptions(context).noClear
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
