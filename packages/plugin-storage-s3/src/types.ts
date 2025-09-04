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
import { S3DriverOptions } from "unstorage/drivers/s3";

export type StorageS3PluginOptions = StoragePluginOptions & S3DriverOptions;

export type StorageS3PluginContext<
  TOptions extends StorageS3PluginOptions = StorageS3PluginOptions
> = StoragePluginContext<TOptions>;
