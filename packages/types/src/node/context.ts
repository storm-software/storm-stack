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

import { StormBaseConfig } from "../shared/config";
import { IStormLog } from "../shared/log";
import { IStormPayload } from "../shared/payload";
import { StormBuildInfo, StormEnvPaths, StormRuntimeInfo } from "./env";
import { IStormEvent } from "./event";

/**
 * A store that exists on the StormContext for internal use.
 *
 * @remarks
 * Please do not use this in application code as it is likely to change
 *
 * @internal
 */
interface Internal_StormContextStore {
  /**
   * List of events that have been emitted
   *
   * @internal
   */
  events: IStormEvent[];
}

/**
 * The global Storm Stack application context. This object contains information related to the current process's execution.
 *
 * @remarks
 * The Storm Stack application context object is injected into the global scope of the application. It can be accessed using `$storm` or `useStorm()` in the application code.
 */
export type StormContext<
  TConfig extends StormBaseConfig = StormBaseConfig,
  TAdditionalFields extends Record<string, any> = Record<string, any>,
  TPayload extends IStormPayload = IStormPayload
> = TAdditionalFields & {
  /**
   * The name of the Storm application.
   */
  readonly name: string;

  /**
   * The version of the Storm application.
   */
  readonly version: string;

  /**
   * The configuration parameters for the Storm application.
   */
  readonly config: TConfig;

  /**
   * The runtime information for the Storm application.
   */
  readonly runtime: StormRuntimeInfo;

  /**
   * The build information for the Storm application.
   */
  readonly build: StormBuildInfo;

  /**
   * The environment paths for storing things like data, config, logs, and cache in the current runtime environment.
   *
   * @remarks
   * On macOS, directories are generally created in \`~/Library/Application Support/<name>\`.
   * On Windows, directories are generally created in \`%AppData%/<name>\`.
   * On Linux, directories are generally created in \`~/.config/<name>\` - this is determined via the [XDG Base Directory spec](https://specifications.freedesktop.org/basedir-spec/latest/).
   *
   * If the \`STORM_DATA_DIR\`, \`STORM_CONFIG_DIR\`, \`STORM_CACHE_DIR\`, \`STORM_LOG_DIR\`, or \`STORM_TEMP_DIR\` environment variables are set, they will be used instead of the default paths.
   */
  readonly paths: StormEnvPaths;

  /**
   * The current payload object for the Storm application.
   */
  readonly payload: TPayload;

  /**
   * The current meta object.
   */
  readonly meta: Record<string, any>;

  /**
   * The root application logger for the Storm Stack application.
   */
  readonly log: IStormLog;

  /**
   * The root [unstorage](https://unstorage.unjs.io/) storage to use for Storm Stack application.
   */
  readonly storage: import("unstorage").Storage;

  /**
   * A function to emit an event to a processing queue.
   */
  emit: <TEvent extends IStormEvent<string, any>>(event: TEvent) => void;

  /**
   * A store that exists on the StormContext for internal use.
   *
   * @remarks
   * Please do not use this in application code as it is likely to change
   *
   * @internal
   */
  __internal: Internal_StormContextStore;
};
