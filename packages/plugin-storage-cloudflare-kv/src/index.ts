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

import { parse as parseToml, stringify as stringifyToml } from "@ltd/j-toml";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import type { StoragePluginConfig } from "@storm-stack/devkit/plugins/storage";
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import { readFile } from "@stryke/fs";
import { existsSync, joinPaths } from "@stryke/path";
import type { KVOptions } from "unstorage/drivers/cloudflare-kv-binding";
import type { KVHTTPOptions } from "unstorage/drivers/cloudflare-kv-http";

export type StorageCloudflareKVPluginConfig = StoragePluginConfig &
  Omit<KVOptions, "binding"> & {
    /**
     * The binding name for the Cloudflare KV.
     *
     * @remarks
     * This is used to access the Cloudflare KV binding in the worker.
     *
     * @defaultValue "STORAGE"
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

export default class StorageCloudflareKVPlugin<
  TOptions extends Options = Options
> extends StoragePlugin<TOptions> {
  public constructor(
    protected override config: StorageCloudflareKVPluginConfig
  ) {
    super(
      config,
      "storage-cloudflare-kv-plugin",
      "@storm-stack/plugin-storage-cloudflare-kv"
    );

    this.config.minTTL ??= 60;
  }

  public override addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "prepare:deploy": this.#prepareDeploy.bind(this)
    });

    super.addHooks(hooks);
  }

  protected override writeStorage() {
    if (this.config.binding) {
      return `${getFileHeader()}

import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";
import { env } from "cloudflare:workers";

export default cloudflareKVBindingDriver({ binding: env.${this.config.binding}, minTTL: ${this.config.minTTL ?? 60} });
`;
    } else {
      return `${getFileHeader()}

import cloudflareKVHTTPDriver from "unstorage/drivers/cloudflare-kv-http";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || $storm.vars.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN || $storm.vars.CLOUDFLARE_API_TOKEN;
const email = process.env.CLOUDFLARE_EMAIL || $storm.vars.CLOUDFLARE_EMAIL;
const apiKey = process.env.CLOUDFLARE_API_KEY || $storm.vars.CLOUDFLARE_API_KEY;
const userServiceKey = process.env.CLOUDFLARE_USER_SERVICE_KEY || $storm.vars.CLOUDFLARE_USER_SERVICE_KEY;

if (!accountId) {
  throw new StormError({ type: "general", code: 13 });
}
if (!apiToken && (!email || !apiKey) && !userServiceKey) {
  throw new StormError({ type: "general", code: 14 });
}

export default cloudflareKVHTTPDriver({
  accountId,
  namespaceId: ${this.config.namespace ? `"${this.config.namespace}"` : "undefined"},
  apiToken,
  email,
  apiKey,
  userServiceKey,
  minTTL: ${this.config.minTTL ?? 60}
});
`;
    }
  }

  async #prepareDeploy(context: Context<TOptions>) {
    if (context.options.projectType === "application") {
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

      wranglerFile.kv_namespaces ??= [];
      wranglerFile.kv_namespaces.push({
        binding: this.config.binding || "STORAGE",
        id: this.config.namespace
      });

      return this.writeFile(
        wranglerFilePath,
        stringifyToml(wranglerFile, {
          newline: "\n",
          newlineAround: "header",
          indent: 4,
          forceInlineArraySpacing: 0
        }),
        true
      );
    }
  }
}
