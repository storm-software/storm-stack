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
import { ConfigPluginOptions } from "@storm-stack/plugin-config/types";
import { KVOptions } from "unstorage/drivers/cloudflare-kv-binding";
import { KVHTTPOptions } from "unstorage/drivers/cloudflare-kv-http";

export type StorageCloudflareKVPluginOptions = StoragePluginOptions &
  Omit<KVOptions, "binding"> & {
    /**
     * The binding name for the Cloudflare KV.
     *
     * @remarks
     * This is used to access the Cloudflare KV binding in the worker.
     */
    binding?: string;

    /**
     * The minimum TTL for the Cloudflare KV.
     *
     * @remarks
     * This is used to set the minimum TTL for the Cloudflare KV.
     *
     * @defaultValue 60
     */
    minTTL: number;

    /**
     * The options provided to the \`\@storm-stack/plugin-config\` plugin.
     */
    config?: ConfigPluginOptions;
  } & Omit<KVHTTPOptions, "namespaceId" | "minTTL">;

export type StorageCloudflareKVPluginContext<
  TOptions extends
    StorageCloudflareKVPluginOptions = StorageCloudflareKVPluginOptions
> = StoragePluginContext<TOptions>;
