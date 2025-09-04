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
import { CloudflareR2Options } from "unstorage/drivers/cloudflare-r2-binding";

export type StorageCloudflareR2PluginOptions = StoragePluginOptions &
  Omit<CloudflareR2Options, "binding"> & {
    /**
     * The binding name for the Cloudflare R2.
     *
     * @remarks
     * This is used to access the Cloudflare R2 binding in the worker.
     */
    binding?: string;
  };

export type StorageCloudflareR2PluginContext<
  TOptions extends
    StorageCloudflareR2PluginOptions = StorageCloudflareR2PluginOptions
> = StoragePluginContext<TOptions>;
