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
import { LogPluginOptions } from "@storm-stack/devkit/plugins/log";
import {
  ConfigPluginContextOptions,
  ConfigPluginReflectionRecord
} from "@storm-stack/plugin-config/types";

/**
 * Configuration options for the Sentry logging plugin.
 */
export interface StormSentryLogConfig {
  /**
   * The DSN for Sentry
   *
   * @remarks
   * This is used to send logs to Sentry.
   */
  SENTRY_DSN: string;
}

export interface LogSentryPluginOptions extends LogPluginOptions {
  /**
   * The Sentry DSN to use for logging.
   *
   * @remarks
   * If not provided, the plugin will try to read the `SENTRY_DSN` environment variable.
   */
  dsn: string;

  /**
   * Whether notification messages will be sent to Sentry.
   *
   * @remarks
   * If the current `mode` is set to "development", this value will be set to `false` automatically. This functionality can be overridden by manually setting this option to `true`.
   *
   * @defaultValue true
   */
  enabled?: boolean;
}

export interface LogSentryPluginContextOptions
  extends ConfigPluginContextOptions {
  sentry: LogSentryPluginOptions;
}

export type LogSentryPluginContext = Context<
  LogSentryPluginContextOptions,
  ConfigPluginReflectionRecord
>;
