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

/**
 * Interface representing the static build information for the Storm application.
 */
export interface StormBuildInfo {
  /**
   * The package name of the application.
   */
  packageName: string;

  /**
   * The version of the application.
   */
  version: string;

  /**
   * The unique identifier for the build.
   */
  buildId: string;

  /**
   * The timestamp for the build.
   */
  timestamp: number;

  /**
   * The unique identifier for the release.
   */
  releaseId: string;

  /**
   * The tag associated with the release.
   *
   * @remarks
   * This is in the format of "\<APP_NAME\>\@\<APP_VERSION\>".
   */
  releaseTag: string;

  /**
   * The name of the organization that maintains the application.
   */
  organization: string;

  /**
   * The mode in which the application is running (e.g., 'development', 'staging', 'production').
   */
  mode: "development" | "staging" | "production";

  /**
   * The platform for which the application was built.
   */
  platform: "node" | "browser" | "neutral";

  /**
   * Indicates if the application is running in a production environment.
   */
  isProduction: boolean;

  /**
   * Indicates if the application is running in a staging environment.
   */
  isStaging: boolean;

  /**
   * Indicates if the application is running in a development environment.
   */
  isDevelopment: boolean;
}

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
export interface StormEnvPaths {
  data: string;
  config: string;
  cache: string;
  log: string;
  temp: string;
}

/**
 * Interface representing the dynamic runtime information for the Storm application.
 */
export interface StormRuntimeInfo {
  /**
   * Indicates if the application is running in debug mode.
   */
  isDebug: boolean;

  /**
   * Indicates if the application is running in a test environment.
   */
  isTest: boolean;

  /**
   * Indicates if the application is running on Node.js.
   */
  isNode: boolean;

  /**
   * Indicates if the application is running on a Windows operating system.
   */
  isWindows: boolean;

  /**
   * Indicates if the application is running on a Linux operating system.
   */
  isLinux: boolean;

  /**
   * Indicates if the application is running on a macOS operating system.
   */
  isMacOS: boolean;

  /**
   * Indicates if the application is running in a Continuous Integration (CI) environment.
   */
  isCI: boolean;

  /**
   * Indicates if the current process is interactive
   *
   * @see https://github.com/sindresorhus/is-interactive/blob/dc8037ae1a61d828cfb42761c345404055b1e036/index.js
   *
   * @remarks
   * Checks `stdin` for our prompts - It checks that the stream is TTY, not a dumb terminal
   */
  isInteractive: boolean;

  /**
   * Indicates if the application has a TTY (teletypewriter) interface.
   */
  hasTTY: boolean;

  /**
   * Indicates if the application is running in a minimal environment.
   */
  isMinimal: boolean;

  /**
   * Indicates if Unicode characters are supported in the terminal.
   */
  isUnicodeSupported: boolean;

  /**
   * Indicates if color output is supported in the terminal.
   */
  isColorSupported: boolean;

  /**
   * Indicates if the application is running in a server environment.
   */
  isServer: boolean;

  /**
   * The default locale used by the application.
   */
  defaultLocale: string;

  /**
   * The default timezone used by the application.
   */
  defaultTimezone: string;
}
