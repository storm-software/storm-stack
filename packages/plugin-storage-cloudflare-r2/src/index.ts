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
import type { CloudflareR2Options } from "unstorage/drivers/cloudflare-r2-binding";

export type StorageCloudflareR2PluginConfig = StoragePluginConfig &
  Omit<CloudflareR2Options, "binding"> & {
    /**
     * The binding name for the Cloudflare R2.
     *
     * @remarks
     * This is used to access the Cloudflare R2 binding in the worker.
     */
    binding?: string;
  };

export default class StorageCloudflareR2Plugin<
  TOptions extends Options = Options
> extends StoragePlugin<TOptions> {
  public constructor(
    protected override config: StorageCloudflareR2PluginConfig
  ) {
    super(
      config,
      "storage-cloudflare-r2-plugin",
      "@storm-stack/plugin-storage-cloudflare-r2"
    );

    if (this.config.binding) {
      this.installs["aws4fetch@1.0.20"] = "dependency";
    }
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

import cloudflareR2BindingDriver from "unstorage/drivers/cloudflare-r2-binding";
import { env } from "cloudflare:workers";

export default cloudflareR2BindingDriver({ binding: env.${this.config.binding}, base: ${this.config.base || "undefined"} });
`;
    } else {
      return `${getFileHeader()}

import s3Driver from "unstorage/drivers/s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || $storm.vars.CLOUDFLARE_ACCOUNT_ID;
const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || $storm.vars.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || $storm.vars.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

if (!accountId) {
  throw new StormError({
    type: "general", code: 13, params: ["Cloudflare R2 storage"]
  });
}
if (!accessKey && !secretAccessKey) {
  throw new StormError({ type: "general", code: 15 });
}

export default s3Driver({
  accessKeyId: accessKey,
  secretAccessKey: secretAccessKey,
  endpoint: \`https://\${accountId}.r2.cloudflarestorage.com\`,
  bucket: "${this.config.namespace}",
  region: "auto",
});
`;
    }
  }

  async #prepareDeploy(context: Context<TOptions>) {
    if (context.options.projectType === "application" && this.config.binding) {
      this.log(
        LogLevelLabel.TRACE,
        "Writing the Cloudflare R2 binding to the wrangler file."
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
        r2_buckets?: Array<{ binding: string; bucket_name: string }>;
      };

      wranglerFile.r2_buckets ??= [];
      wranglerFile.r2_buckets.push({
        binding: this.config.binding,
        bucket_name: this.config.namespace
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
