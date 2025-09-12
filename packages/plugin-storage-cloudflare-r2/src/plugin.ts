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
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import { existsSync } from "@stryke/fs/exists";
import { readFile } from "@stryke/fs/read-file";
import { joinPaths } from "@stryke/path/join-paths";
import {
  StorageCloudflareR2PluginContext,
  StorageCloudflareR2PluginOptions
} from "./types";

/**
 * Cloudflare R2 storage plugin for Storm Stack.
 */
export default class StorageCloudflareR2Plugin<
  TContext extends
    StorageCloudflareR2PluginContext = StorageCloudflareR2PluginContext,
  TOptions extends
    StorageCloudflareR2PluginOptions = StorageCloudflareR2PluginOptions
> extends StoragePlugin<TContext, TOptions> {
  public constructor(options: PluginOptions<TOptions>) {
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
  public override addHooks(hooks: EngineHooks<TContext>) {
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
  protected override writeStorage(context: TContext) {
    if (this.getOptions(context).binding) {
      return `${getFileHeader()}

import type { StorageAdapter } from "@storm-stack/core/runtime-types/shared/storage";
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
    this.getOptions(context).binding
  }, base: ${this.getOptions(context).base || "undefined"} }) as StorageAdapter;
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
  if (!$storm.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new StormError({
      type: "general", code: 13, params: ["Cloudflare R2 storage"]
    });
  }

  if (!$storm.env.CLOUDFLARE_R2_ACCESS_KEY_ID && !$storm.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new StormError({ type: "general", code: 15 });
  }

  const adapter = s3Driver({
    accessKeyId: $storm.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: $storm.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    endpoint: \`https://\${$storm.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com\`,
    bucket: "${this.getOptions(context).namespace}",
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
  protected async prepareConfig(context: TContext) {
    if (
      context.options.projectType === "application" &&
      this.getOptions(context).binding
    ) {
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
            r2Bucket.binding === this.getOptions(context).binding &&
            r2Bucket.bucket_name === this.getOptions(context).namespace
        )
      ) {
        wranglerFile.r2_buckets ??= [];
        wranglerFile.r2_buckets.push({
          binding: this.getOptions(context).binding!,
          bucket_name: this.getOptions(context).namespace
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
