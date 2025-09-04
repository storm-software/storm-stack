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

import {
  StoragePluginContext,
  StoragePluginOptions
} from "@storm-stack/devkit/types/plugins";
import { StormEnvPathType } from "@storm-stack/types/node/env";
import { FSStorageOptions } from "unstorage/drivers/fs-lite";

export type StorageFileSystemPluginOptions = FSStorageOptions &
  StoragePluginOptions & {
    /**
     * The environment path to use for the storage.
     *
     * @remarks
     * These environment paths are returned using the \`\@stryke/env\` package.
     */
    envPath?: StormEnvPathType;
  };

export type StorageFileSystemPluginContext<
  TOptions extends
    StorageFileSystemPluginOptions = StorageFileSystemPluginOptions
> = StoragePluginContext<TOptions>;
