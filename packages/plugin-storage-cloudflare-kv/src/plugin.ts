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
import type { EngineHooks } from "@storm-stack/core/types";
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import { StoragePlugin } from "@storm-stack/devkit/plugins/storage";
import { existsSync } from "@stryke/fs/exists";
import { readFile } from "@stryke/fs/read-file";
import { joinPaths } from "@stryke/path/join-paths";
import {
  StorageCloudflareKVPluginContext,
  StorageCloudflareKVPluginOptions
} from "./types";

/**
 * Cloudflare KV Storage Plugin
 */
export default class StorageCloudflareKVPlugin<
  TContext extends
    StorageCloudflareKVPluginContext = StorageCloudflareKVPluginContext,
  TOptions extends
    StorageCloudflareKVPluginOptions = StorageCloudflareKVPluginOptions
> extends StoragePlugin<TContext, TOptions> {
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.options.minTTL ??= 60;

    this.dependencies = [["@storm-stack/plugin-env", options.env ?? {}]];
  }

  /**
   * Adds the plugin hooks to the engine hooks.
   *
   * @param hooks - The engine hooks to add the plugin hooks to.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    hooks.addHooks({
      "prepare:config": this.#prepareConfig.bind(this)
    });

    super.addHooks(hooks);
  }

  protected override writeStorage(context: TContext) {
    if (this.getOptions(context).binding) {
      return `${getFileHeader()}

import type { StorageAdapter } from "@storm-stack/core/runtime-types/shared/storage";
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
    this.getOptions(context).binding
  }, minTTL: ${this.getOptions(context).minTTL ?? 60} }) as StorageAdapter;
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

import type { StorageAdapter } from "@storm-stack/core/runtime-types/shared/storage";
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
  const accountId = $storm.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = $storm.env.CLOUDFLARE_API_TOKEN;
  const email = $storm.env.CLOUDFLARE_EMAIL;
  const apiKey = $storm.env.CLOUDFLARE_API_KEY;
  const userServiceKey = $storm.env.CLOUDFLARE_USER_SERVICE_KEY;

  if (!accountId) {
    throw new StormError({
      type: "general", code: 13, params: ["Cloudflare KV storage"]
    });
  }

  if (!apiToken && (!email || !apiKey) && !userServiceKey) {
    throw new StormError({ type: "general", code: 14 });
  }

  const adapter = cloudflareKVHTTPDriver({
    accountId,
    namespaceId: ${
      this.getOptions(context).namespace
        ? `"${this.getOptions(context).namespace}"`
        : "undefined"
    },
    apiToken,
    email,
    apiKey,
    userServiceKey,
    minTTL: ${this.getOptions(context).minTTL ?? 60}
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

  async #prepareConfig(context: TContext) {
    if (
      context.options.projectType === "application" &&
      this.getOptions(context).binding
    ) {
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
            kvNamespace.binding === this.getOptions(context).binding &&
            kvNamespace.id === this.getOptions(context).namespace
        )
      ) {
        wranglerFile.kv_namespaces ??= [];
        wranglerFile.kv_namespaces.push({
          binding: this.getOptions(context).binding!,
          id: this.getOptions(context).namespace
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
