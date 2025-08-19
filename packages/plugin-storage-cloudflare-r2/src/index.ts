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
import type { CloudflareR2Options } from "unstorage/drivers/cloudflare-r2-binding";

export type StorageCloudflareR2PluginConfig = StoragePluginOptions &
  Omit<CloudflareR2Options, "binding"> & {
    /**
     * The binding name for the Cloudflare R2.
     *
     * @remarks
     * This is used to access the Cloudflare R2 binding in the worker.
     */
    binding?: string;
  };

export default class StorageCloudflareR2Plugin extends StoragePlugin<StorageCloudflareR2PluginConfig> {
  public constructor(options: PluginOptions<StorageCloudflareR2PluginConfig>) {
    super(options);

    if (this.options.binding) {
      this.packageDeps["aws4fetch@1.0.20"] = "dependency";
    }
  }

  /**
   * Adds hooks to the Storm Stack engine for the Cloudflare R2 storage plugin.
   *
   * @param hooks - The engine hooks to add
   */
  public override addHooks(hooks: EngineHooks) {
    hooks.addHooks({
      "prepare:config": this.prepareConfig.bind(this)
    });

    super.addHooks(hooks);
  }

  /**
   * Writes the storage runtime source code for the Cloudflare R2 storage plugin.
   *
   * @returns The source code as a string
   */
  protected override writeStorage() {
    if (this.options.binding) {
      return `${getFileHeader()}

import type { StorageAdapter } from "@storm-stack/types/shared/storage";
import cloudflareR2BindingDriver from "unstorage/drivers/cloudflare-r2-binding";
import { env } from "cloudflare:workers";

/**
 * Create an [Cloudflare R2](https://developers.cloudflare.com/r2/) storage adapter.
 *
 * @see [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
 *
 * @returns The Cloudflare R2 {@link StorageAdapter | storage adapter}.
 */
function createAdapter(): StorageAdapter {
  const adapter = cloudflareR2BindingDriver({ binding: env.${
    this.options.binding
  }, base: ${this.options.base || "undefined"} }) as StorageAdapter;
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
import s3Driver from "unstorage/drivers/s3";
import { StormError } from "storm:error";

/**
 * Create an [Cloudflare R2](https://developers.cloudflare.com/r2/) storage adapter.
 *
 * @see [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
 *
 * @returns The Cloudflare R2 {@link StorageAdapter | storage adapter}.
 */
function createAdapter(): StorageAdapter {
  const accountId = $storm.config.CLOUDFLARE_ACCOUNT_ID;
  const accessKey = $storm.config.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = $storm.config.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId) {
    throw new StormError({
      type: "general", code: 13, params: ["Cloudflare R2 storage"]
    });
  }

  if (!accessKey && !secretAccessKey) {
    throw new StormError({ type: "general", code: 15 });
  }

  const adapter = s3Driver({
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
    endpoint: \`https://\${accountId}.r2.cloudflarestorage.com\`,
    bucket: "${this.options.namespace}",
    region: "auto",
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

  /**
   * Prepares the configuration for the Cloudflare R2 storage plugin.
   *
   * @param context - The Storm Stack context
   * @returns A promise that resolves when the configuration is prepared
   */
  protected async prepareConfig(context: Context) {
    if (context.options.projectType === "application" && this.options.binding) {
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
      if (
        !wranglerFile.r2_buckets?.some(
          r2Bucket =>
            r2Bucket.binding === this.options.binding &&
            r2Bucket.bucket_name === this.options.namespace
        )
      ) {
        wranglerFile.r2_buckets ??= [];
        wranglerFile.r2_buckets.push({
          binding: this.options.binding,
          bucket_name: this.options.namespace
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
