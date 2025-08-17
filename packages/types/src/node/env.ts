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
   * The environment in which the application is running.
   */
  environment: string;

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

  /**
   * Indicates if the application is running in debug mode.
   */
  isDebug: boolean;

  /**
   * Indicates if the application is running in a test environment.
   */
  isTest: boolean;
}

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
export interface StormEnvInterface {
  /**
   * Indicates if the current process has a TTY (interactive terminal) available.
   */
  hasTTY: boolean;

  /**
   * A boolean indicator specifying if the application is running in a Continuous Integration (CI) environment.
   */
  isCI: boolean;

  /**
   * The current runtime mode to determine the behavior of the application in different environments.
   *
   * @remarks
   * The `mode` is typically set based on the deployment environment and can affect configuration, logging, and feature flags. Valid values for the `mode` are:
   * - `"development"`: Used for local development and testing.
   * - `"staging"`: Used for staging environments that closely mirror production.
   * - `"production"`: Used for live production environments.
   */
  mode: "development" | "staging" | "production";

  /**
   * The environment name as specified in the plugin context.
   */
  environment: string;

  /**
   * A boolean indicator specifying if running in production mode.
   */
  isProduction: boolean;

  /**
   * A boolean indicator specifying if running in staging mode.
   */
  isStaging: boolean;

  /**
   * A boolean indicator specifying if running in development mode.
   */
  isDevelopment: boolean;

  /**
   * A boolean indicator specifying if running in debug mode (typically development with debug enabled).
   */
  isDebug: boolean;

  /**
   * A boolean indicator specifying if running in test mode or under test conditions.
   */
  isTest: boolean;

  /**
   * A boolean indicator specifying if running in a minimal environment (e.g., CI, test, or no TTY).
   */
  isMinimal: boolean;

  /**
   * A boolean indicator specifying if the runtime platform is Windows.
   */
  isWindows: boolean;

  /**
   * A boolean indicator specifying if the runtime platform is Linux.
   */
  isLinux: boolean;

  /**
   * A boolean indicator specifying if the runtime platform is macOS.
   */
  isMacOS: boolean;

  /**
   * A boolean indicator specifying if running in Node.js or a Node.js-compatible runtime.
   */
  isNode: boolean;

  /**
   * A boolean indicator specifying if running in a server environment (Node.js or specified platform).
   */
  isServer: boolean;

  /**
   * A boolean indicator specifying if the environment supports interactive input/output.
   */
  isInteractive: boolean;

  /**
   * A boolean indicator specifying if the terminal supports Unicode characters.
   */
  isUnicodeSupported: boolean;

  /**
   * A boolean indicator specifying if the terminal supports colored output.
   */
  isColorSupported: boolean;

  /**
   * An object describing the color support level for stdout and stderr streams.
   */
  supportsColor: {
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
  organization: string;

  /**
   * The application name.
   */
  name: string;

  /**
   * The package name from package.json or the application name.
   */
  packageName: string;

  /**
   * The current application version.
   */
  version: string;

  /**
   * The build identifier for the current release.
   */
  buildId: string;

  /**
   * The build or release timestamp.
   */
  timestamp: number;

  /**
   * The release identifier.
   */
  releaseId: string;

  /**
   * A tag combining the application name and version.
   */
  releaseTag: string;

  /**
   * The default locale for the application.
   */
  defaultLocale: string;

  /**
   * The default timezone for the application.
   */
  defaultTimezone: string;

  /**
   * The runtime platform (e.g., "node", "web", etc.).
   */
  platform: StormBuildInfo["platform"];

  /**
   * An object containing standardized paths for data, config, cache, logs, and temp files, adapted to the current OS and environment variables.
   */
  paths: StormEnvPaths;
}
