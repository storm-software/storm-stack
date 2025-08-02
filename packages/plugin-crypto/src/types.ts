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

import { Context } from "@storm-stack/core/types/context";
import { PluginBaseConfig } from "@storm-stack/core/types/plugin";
import {
  DotenvPluginConfig,
  ResolvedDotenvOptions
} from "@storm-stack/plugin-dotenv/types";
import { ErrorPluginConfig } from "@storm-stack/plugin-error/types";
import { StormBaseConfig } from "@storm-stack/types/config";

export interface StormCryptoConfig extends StormBaseConfig {
  /**
   * The DSN for Sentry
   *
   * @remarks
   * This is used to send logs to Sentry.
   */
  ENCRYPTION_KEY: string;
}

export interface CryptoPluginConfig extends PluginBaseConfig {
  /**
   * A string key value used in encryption/decryption.
   */
  encryptionKey?: string;

  /**
   * Options for the dotenv plugin.
   */
  dotenv?: DotenvPluginConfig;

  /**
   * Options for the error plugin.
   */
  error?: Omit<ErrorPluginConfig, "dotenv">;
}

export interface CryptoPluginContextOptions {
  crypto: Required<Omit<CryptoPluginConfig, "dotenv" | "error">>;
  dotenv: ResolvedDotenvOptions;
  error: ErrorPluginConfig;
}

export type CryptoPluginContext = Context<CryptoPluginContextOptions>;
