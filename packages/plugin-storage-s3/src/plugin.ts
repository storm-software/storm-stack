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

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import { StorageS3PluginContext, StorageS3PluginOptions } from "./types";

export default class StorageS3Plugin<
  TContext extends StorageS3PluginContext = StorageS3PluginContext,
  TOptions extends StorageS3PluginOptions = StorageS3PluginOptions
> extends StoragePlugin<TContext, TOptions> {
  protected override packageDeps = {
    "aws4fetch@1.0.20": "dependency"
  } as Record<string, "dependency" | "devDependency">;

  public constructor(options: PluginOptions<TOptions>) {
    super(options);
  }

  protected override writeStorage(context: TContext) {
    return `${getFileHeader()}

import type { StorageAdapter } from "@storm-stack/core/runtime-types/shared/storage";
import s3Driver from "unstorage/drivers/s3";
import { StormError } from "storm:error";

/**
 * Create an [S3](https://aws.amazon.com/s3/) storage adapter.
 *
 * @see [S3 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
 *
 * @returns The S3 {@link StorageAdapter | storage adapter}.
 */
function createAdapter(): StorageAdapter {
  const accessKey = $storm.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = $storm.env.AWS_SECRET_ACCESS_KEY;
  const region = ${
    this.getOptions(context).region
      ? `"${this.getOptions(context).region}"`
      : "$storm.env.AWS_REGION"
  };

  if (!accessKey && !secretAccessKey) {
    throw new StormError({ type: "general", code: 15 });
  }

  const adapter = s3Driver({
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
    endpoint: \`https://s3.\${region}.amazonaws.com/\`,
    bucket: "${this.getOptions(context).bucket}",
    region,
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
