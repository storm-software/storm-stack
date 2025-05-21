/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

export interface ProviderInfo {
  name: string;
  ci?: boolean;
  [meta: string]: any;
}

export type RuntimeName =
  | "workerd"
  | "deno"
  | "netlify"
  | "node"
  | "bun"
  | "edge-light"
  | "fastly"
  | string;

export interface RuntimeInfo {
  name: RuntimeName;
}

/**
 * Interface representing the runtime information for the Storm application.
 */
export interface StormRuntimeInfo extends Partial<RuntimeInfo> {
  /**
   * Indicates if the application is running on Node.js.
   */
  isNode: boolean;

  /**
   * Indicates if the application is running on Bun.
   */
  isBun: boolean;

  /**
   * Indicates if the application is running on Deno.
   */
  isDeno: boolean;

  /**
   * Indicates if the application is running on Fastly.
   */
  isFastly: boolean;

  /**
   * Indicates if the application is running on Netlify.
   */
  isNetlify: boolean;

  /**
   * Indicates if the application is running on EdgeLight.
   */
  isEdgeLight: boolean;

  /**
   * Indicates if the application is running on Workerd.
   */
  isWorkerd: boolean;

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
   * Defaults to check `stdin` for our prompts - It checks that the stream is TTY, not a dumb terminal
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
   * Indicates if color output is supported in the terminal.
   */
  isColorSupported: boolean;

  /**
   * Indicates if the application is running in a server environment.
   */
  isServer: boolean;

  /**
   * The version of Node.js that the application is using, or null if not applicable.
   */
  nodeVersion: string | null;

  /**
   * The major version of Node.js that the application is using, or null if not applicable.
   */
  nodeMajorVersion: number | null;

  /**
   * The provider information for the application.
   */
  provider: ProviderInfo;
}

/**
 * Interface representing the build information for the Storm application.
 */
export interface StormBuildInfo {
  /**
   * The name of the application.
   *
   * @remarks
   * This is the name of the application as defined in env.APP_NAME or package.json file.
   */
  name: string;

  /**
   * The package name of the application.
   */
  packageName: string;

  /**
   * The version of the application.
   *
   * @remarks
   * This is the version of the application as defined in env.APP_VERSION or package.json file.
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
   * The mode in which the application is running (e.g., 'development', 'staging', 'production').
   */
  mode: "development" | "staging" | "production";

  /**
   * The platform for which the application was built.
   */
  platform: "node" | "browser" | "neutral";

  /**
   * Indicates if the application is running in debug mode.
   */
  isDebug: boolean;

  /**
   * Indicates if the application is running in a test environment.
   */
  isTest: boolean;

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
