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

import { PluginConfig } from "@cloudflare/vite-plugin";
import {
  Context,
  ReflectionRecord,
  ResolvedEntryTypeDefinition,
  ResolvedOptions
} from "@storm-stack/core/types";
import { PluginBaseOptions } from "@storm-stack/core/types/plugin";

export type CloudflareWorkerPluginOptions = PluginBaseOptions & {
  /**
   * The Cloudflare account ID.
   */
  accountId?: string;

  /**
   * The name of the Cloudflare Worker.
   */
  workerId?: string;

  /**
   * The path to the Cloudflare configuration file (wrangler.toml).
   *
   * @defaultValue "\{projectRoot\}/wrangler.toml"
   */
  configPath?: string;

  /**
   * Configuration options for the [Vite Cloudflare plugin](https://github.com/cloudflare/workers-sdk/blob/main/packages/vite-plugin-cloudflare).
   *
   * @see [Vite Cloudflare Plugin Documentation](https://developers.cloudflare.com/workers/vite-plugin/)
   */
  cloudflareVitePlugin?: PluginConfig | false;
};

export interface CloudflareWorkerPluginResolvedOptions {
  cloudflare: Required<CloudflareWorkerPluginOptions>;
}

export type CloudflareWorkerPluginContext<
  TOptions extends
    ResolvedOptions<CloudflareWorkerPluginResolvedOptions> = ResolvedOptions<CloudflareWorkerPluginResolvedOptions>,
  // eslint-disable-next-line ts/no-empty-object-type
  TReflections extends { [P in keyof unknown]: ReflectionRecord } = {},
  TEntry extends ResolvedEntryTypeDefinition = ResolvedEntryTypeDefinition
> = Context<TOptions, TReflections, TEntry>;
