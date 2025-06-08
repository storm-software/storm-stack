/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/helpers/utilities/file-header";
import type { Options } from "@storm-stack/core/types";
import type { StoragePluginConfig } from "@storm-stack/devkit/plugins/storage";
import StoragePlugin from "@storm-stack/devkit/plugins/storage";
import type { S3DriverOptions } from "unstorage/drivers/s3";

export type StorageS3PluginPluginConfig = StoragePluginConfig & S3DriverOptions;

export default class StorageS3Plugin<
  TOptions extends Options = Options
> extends StoragePlugin<TOptions> {
  protected override installs = {
    "aws4fetch@1.0.20": "dependency"
  } as Record<string, "dependency" | "devDependency">;

  public constructor(protected override config: StorageS3PluginPluginConfig) {
    super(config, "storage-s3-plugin", "@storm-stack/plugin-storage-s3");
  }

  protected override writeStorage() {
    return `${getFileHeader()}

import s3Driver from "unstorage/drivers/s3";

const accessKey = process.env.AWS_ACCESS_KEY_ID || $storm.config.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || $storm.config.AWS_SECRET_ACCESS_KEY;

if (!accessKey && !secretAccessKey) {
  throw new StormError({ type: "general", code: 15 });
}

export default s3Driver({
  accessKeyId: accessKey,
  secretAccessKey: secretAccessKey,
  endpoint: \`https://s3.${this.config.region}.amazonaws.com/\`,
  bucket: "${this.config.bucket}",
  region: "${this.config.region}",
});
`;
  }
}
