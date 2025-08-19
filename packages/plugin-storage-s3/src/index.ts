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
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import type { StoragePluginOptions } from "@storm-stack/devkit/plugins/storage";
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import type { S3DriverOptions } from "unstorage/drivers/s3";

export type StorageS3PluginPluginOptions = StoragePluginOptions &
  S3DriverOptions;

export default class StorageS3Plugin extends StoragePlugin<StorageS3PluginPluginOptions> {
  protected override packageDeps = {
    "aws4fetch@1.0.20": "dependency"
  } as Record<string, "dependency" | "devDependency">;

  public constructor(options: PluginOptions<StorageS3PluginPluginOptions>) {
    super(options);
  }

  protected override writeStorage() {
    return `${getFileHeader()}

import type { StorageAdapter } from "@storm-stack/types/shared/storage";
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
  const accessKey = $storm.config.AWS_ACCESS_KEY_ID;
  const secretAccessKey = $storm.config.AWS_SECRET_ACCESS_KEY;
  const region = ${
    this.options.region
      ? `"${this.options.region}"`
      : "$storm.config.AWS_REGION"
  };

  if (!accessKey && !secretAccessKey) {
    throw new StormError({ type: "general", code: 15 });
  }

  const adapter = s3Driver({
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
    endpoint: \`https://s3.\${region}.amazonaws.com/\`,
    bucket: "${this.options.bucket}",
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
