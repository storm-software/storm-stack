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

import { StormEnv } from "../shared/env";

/**
 * The environment paths for storing things like data, config, logs, and cache in the current runtime environment.
 *
 * @remarks
 * These environment path types are accessed in the {@link StormEnvPaths} type.
 */
export type StormEnvPathType = "data" | "config" | "cache" | "log" | "temp";

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
export type StormEnvPaths = Record<StormEnvPathType, string>;

/**
 * Interface representing the environment information for the Storm application.
 *
 * @remarks
 * The environment information includes information about the current runtime environment, such as the operating system, architecture, and other relevant details.
 */
export interface StormNodeEnv extends StormEnv {
  /**
   * The platform for which the application was built.
   */
  readonly platform: "node" | "browser" | "neutral";

  /**
   * The environment name as specified in the plugin context.
   */
  readonly environment: string;

  /**
   * Indicates if the current process has a TTY (interactive terminal) available.
   */
  readonly hasTTY: boolean;

  /**
   * A boolean indicator specifying if the application is running in a Continuous Integration (CI) environment.
   */
  readonly isCI: boolean;

  /**
   * A boolean indicator specifying if running in a minimal environment (e.g., CI, test, or no TTY).
   */
  readonly isMinimal: boolean;

  /**
   * A boolean indicator specifying if the runtime platform is Windows.
   */
  readonly isWindows: boolean;

  /**
   * A boolean indicator specifying if the runtime platform is Linux.
   */
  readonly isLinux: boolean;

  /**
   * A boolean indicator specifying if the runtime platform is macOS.
   */
  readonly isMacOS: boolean;

  /**
   * A boolean indicator specifying if running in Node.js or a Node.js-compatible runtime.
   */
  readonly isNode: boolean;

  /**
   * A boolean indicator specifying if running in a server environment (Node.js or specified platform).
   */
  readonly isServer: boolean;

  /**
   * A boolean indicator specifying if the environment supports interactive input/output.
   */
  readonly isInteractive: boolean;

  /**
   * A boolean indicator specifying if the terminal supports Unicode characters.
   */
  readonly isUnicodeSupported: boolean;

  /**
   * A boolean indicator specifying if the terminal supports colored output.
   */
  readonly isColorSupported: boolean;

  /**
   * An object describing the color support level for stdout and stderr streams.
   */
  readonly supportsColor: {
    stdout:
      | boolean
      | number
      | {
          level: number;
          hasBasic: boolean;
          has256: boolean;
          has16m: boolean;
        };
    stderr:
      | boolean
      | number
      | {
          level: number;
          hasBasic: boolean;
          has256: boolean;
          has16m: boolean;
        };
  };

  /**
   * The name of the organization maintaining the application.
   */
  readonly organization: string;

  /**
   * The package name from package.json or the application name.
   */
  readonly packageName: string;

  /**
   * The build identifier for the current release.
   */
  readonly buildId: string;

  /**
   * The build or release timestamp.
   */
  readonly timestamp: number;

  /**
   * The release identifier.
   */
  readonly releaseId: string;

  /**
   * A tag combining the application name and version.
   */
  readonly releaseTag: string;

  /**
   * An object containing standardized paths for data, config, cache, logs, and temp files, adapted to the current OS and environment variables.
   */
  readonly paths: StormEnvPaths;
}
