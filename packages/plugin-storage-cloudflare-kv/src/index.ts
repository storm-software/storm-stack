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

import { parse as parseToml, stringify as stringifyToml } from "@ltd/j-toml";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import type { Context, EngineHooks } from "@storm-stack/core/types";
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import type { StoragePluginOptions } from "@storm-stack/devkit/plugins/storage";
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import { readFile } from "@stryke/fs";
import { existsSync, joinPaths } from "@stryke/path";
import type { KVOptions } from "unstorage/drivers/cloudflare-kv-binding";
import type { KVHTTPOptions } from "unstorage/drivers/cloudflare-kv-http";

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
  } & Omit<KVHTTPOptions, "namespaceId" | "minTTL">;

export default class StorageCloudflareKVPlugin extends StoragePlugin<StorageCloudflareKVPluginOptions> {
  public constructor(options: PluginOptions<StorageCloudflareKVPluginOptions>) {
    super(options);

    this.options.minTTL ??= 60;
  }

  /**
   * Adds the plugin hooks to the engine hooks.
   *
   * @param hooks - The engine hooks to add the plugin hooks to.
   */
  public override addHooks(hooks: EngineHooks) {
    hooks.addHooks({
      "prepare:config": this.#prepareConfig.bind(this)
    });

    super.addHooks(hooks);
  }

  protected override writeStorage() {
    if (this.options.binding) {
      return `${getFileHeader()}

import type { StorageAdapter } from "@storm-stack/types/shared/storage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";
import { env } from "cloudflare:workers";

/**
 * Create an [Cloudflare KV](https://developers.cloudflare.com/kv/) storage adapter.
 *
 * @see [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
 *
 * @returns The Cloudflare KV {@link StorageAdapter | storage adapter}.
 */
function createAdapter(): StorageAdapter {
  const adapter = cloudflareKVBindingDriver({ binding: env.${
    this.options.binding
  }, minTTL: ${this.options.minTTL ?? 60} }) as StorageAdapter;
  adapter[Symbol.asyncDispose] = async () => {
    if (adapter.dispose && typeof adapter.dispose === "function") {
      await Promise.resolve(adapter.dispose());
    }
  };

  return adapter;
}

export default createAdapter;

`;
    } else {
      return `${getFileHeader()}

import type { StorageAdapter } from "@storm-stack/types/shared/storage";
import cloudflareKVHTTPDriver from "unstorage/drivers/cloudflare-kv-http";
import { StormError } from "storm:error";

/**
 * Create an [Cloudflare KV](https://developers.cloudflare.com/kv/) storage adapter.
 *
 * @see [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
 *
 * @returns The Cloudflare KV {@link StorageAdapter | storage adapter}.
 */
function createAdapter(): StorageAdapter {
  const accountId = $storm.config.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = $storm.config.CLOUDFLARE_API_TOKEN;
  const email = $storm.config.CLOUDFLARE_EMAIL;
  const apiKey = $storm.config.CLOUDFLARE_API_KEY;
  const userServiceKey = $storm.config.CLOUDFLARE_USER_SERVICE_KEY;

  if (!accountId) {
    throw new StormError({
      type: "general", code: 13, params: ["Cloudflare KV storage"]
    });
  }

  if (!apiToken && (!email || !apiKey) && !userServiceKey) {
    throw new StormError({ type: "general", code: 14 });
  }

  export const adapter = cloudflareKVHTTPDriver({
    accountId,
    namespaceId: ${
      this.options.namespace ? `"${this.options.namespace}"` : "undefined"
    },
    apiToken,
    email,
    apiKey,
    userServiceKey,
    minTTL: ${this.options.minTTL ?? 60}
  }) as StorageAdapter;
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

  async #prepareConfig(context: Context) {
    if (context.options.projectType === "application" && this.options.binding) {
      this.log(
        LogLevelLabel.TRACE,
        "Writing the Cloudflare KV binding to the wrangler file."
      );

      const wranglerFilePath = joinPaths(
        context.options.projectRoot,
        "wrangler.toml"
      );
      let wranglerFileContent = "";

      if (existsSync(wranglerFilePath)) {
        wranglerFileContent = await readFile(wranglerFilePath);
      }

      const wranglerFile = parseToml(wranglerFileContent || "") as {
        kv_namespaces?: Array<{ binding: string; id: string }>;
      };
      if (
        !wranglerFile.kv_namespaces?.some(
          kvNamespace =>
            kvNamespace.binding === this.options.binding &&
            kvNamespace.id === this.options.namespace
        )
      ) {
        wranglerFile.kv_namespaces ??= [];
        wranglerFile.kv_namespaces.push({
          binding: this.options.binding,
          id: this.options.namespace
        });
      }

      return context.vfs.writeFileToDisk(
        wranglerFilePath,
        stringifyToml(wranglerFile, {
          newline: "\n",
          newlineAround: "header",
          indent: 4,
          forceInlineArraySpacing: 0
        }),
        { skipFormat: true }
      );
    }
  }
}
