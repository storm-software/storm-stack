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
  LogPluginContext,
  LogPluginOptions,
  LogPluginResolvedOptions
} from "@storm-stack/devkit/types/plugins";

export type LogStoragePluginOptions = Omit<LogPluginOptions, "namespace"> & {
  /**
   * Whether to use the file system storage driver.
   *
   * @defaultValue true
   */
  useFileSystem?: boolean;

  /**
   * The storage ID to use for the log storage.
   *
   * @defaultValue "logs"
   */
  namespace?: string;
};

export type LogStoragePluginResolvedOptions = LogPluginResolvedOptions<
  Required<LogStoragePluginOptions>
>;

export type LogStoragePluginContext<
  TOptions extends
    LogStoragePluginResolvedOptions = LogStoragePluginResolvedOptions
> = LogPluginContext<TOptions>;
