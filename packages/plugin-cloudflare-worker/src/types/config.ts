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

import { StormConfigInterface } from "@storm-stack/types/shared/config";

/**
 * Configuration options for the Storm Cloudflare Worker plugin.
 *
 * @extends StormConfigInterface
 */
export interface StormCloudflareWorkerConfig extends StormConfigInterface {
  /**
   * The Cloudflare account ID associated with the worker.
   */
  CLOUDFLARE_ACCOUNT_ID: string;

  /**
   * The API token used for authenticating requests to Cloudflare's API.
   */
  CLOUDFLARE_API_TOKEN?: string;

  /**
   * The email address associated with the Cloudflare account.
   */
  CLOUDFLARE_EMAIL?: string;

  /**
   * The API key used for authenticating requests to Cloudflare's API.
   */
  CLOUDFLARE_API_KEY?: string;

  /**
   * The user service key for Cloudflare's API.
   */
  CLOUDFLARE_USER_SERVICE_KEY?: string;

  /**
   * The namespace ID for Cloudflare KV storage.
   */
  CLOUDFLARE_KV_NAMESPACE_ID?: string;

  /**
   * The access key ID for Cloudflare R2 storage.
   */
  CLOUDFLARE_R2_ACCESS_KEY_ID?: string;

  /**
   * The secret access key for Cloudflare R2 storage.
   */
  CLOUDFLARE_R2_SECRET_ACCESS_KEY?: string;

  /**
   * The name of the Cloudflare R2 bucket.
   */
  CLOUDFLARE_R2_BUCKET_NAME?: string;
}
