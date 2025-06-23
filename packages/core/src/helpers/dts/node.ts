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

import type { Context } from "../../types/build";
import { getFileHeader } from "../utilities";
import { generateConfig } from "./shared";

export async function generateNodeDeclarations(context: Context) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/types/node" />
`)}
declare global {
  type StormConfig = ${await generateConfig(context)};

  const $storm: StormContext<StormVariables>;
}

export {};
 `;
}

export function generateNodeGlobal(path: string, _context: Context) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/types/node" />
`)}
declare global {
  const _StormEvent: (typeof import("${path}/event"))["StormEvent"];

  class StormEvent<TEventType extends string = string, TEventData = any>
   extends _StormEvent<TEventType, TEventData> {
    /**
    * Creates a new event.
    *
    * @param type - The event type.
    * @param data - The event data.
    */
    public constructor(
      type: TEventType,
      data: TEventData
    ) {
      super(type, data);
    }
  }

  const build: StormBuildInfo;
  const runtime: StormRuntimeInfo;
  const paths: StormEnvPaths;

  const useStorm: () => StormContext<StormVariables>;
  const STORM_ASYNC_CONTEXT: StormContext<StormVariables>;
}

export {};

`;
}

export function generateNodeModules(path: string, _context: Context) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/types/node" />
`)}

declare module "storm:app" {
  const withContext: (typeof import("${path}/app"))["withContext"];

  export { withContext };
}

declare module "storm:env" {
  /** Detect if stdout.TTY is available */
  export const hasTTY: boolean;

  /** Detect if the application is running in a CI environment */
  export const isCI: boolean;

  /** Detect the \`NODE_ENV\` environment variable */
  export const mode: string;

  /** Detect if the application is running in production mode */
  export const isProduction: boolean;

  /** Detect if the application is running in staging mode */
  export const isStaging: boolean;

  /** Detect if the application is running in development mode */
  export const isDevelopment: boolean;

  /** Detect if the application is running in debug mode */
  export const isDebug: boolean;

  /** Detect if the application is running in test mode */
  export const isTest: boolean;

  /** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
  export const isMinimal: boolean;

  /** Detect if the runtime platform is Windows */
  export const isWindows: boolean;

  /** Detect if the runtime platform is Linux */
  export const isLinux: boolean;

  /** Detect if the runtime platform is macOS (darwin kernel) */
  export const isMacOS: boolean;

  /** Detect if the runtime platform is interactive */
  export const isInteractive: boolean;

  /** Detect if Unicode characters are supported */
  export const isUnicodeSupported: boolean;

  /** Detect if color is supported */
  export const isColorSupported: boolean;

  /**
   * Indicates if running in Node.js or a Node.js compatible runtime.
   *
   * **Note:** When running code in Bun and Deno with Node.js compatibility mode, \`isNode\` flag will be also \`true\`, indicating running in a Node.js compatible runtime.
   */
  export const isNode: boolean;

  /** The name of the current application */
  export const appName: string;

  /** The name of the current application */
  export const appVersion: string;

  /** The organization that maintains the application */
  export const organization: string;

  /**
   * Interface representing the static build information for the Storm application.
   */
  const build: StormBuildInfo;

  /**
   * Interface representing the dynamic runtime information for the Storm application.
   */
  const runtime: StormRuntimeInfo;

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
  const paths: StormEnvPaths;

  export {
    hasTTY,
    isCI,
    mode,
    isProduction,
    isStaging,
    isDevelopment,
    isDebug,
    isTest,
    isMinimal,
    isWindows,
    isLinux,
    isMacOS,
    isInteractive,
    isColorSupported,
    isUnicodeSupported,
    isNode,
    appName,
    appVersion,
    organization,
    build,
    runtime,
    paths
  };
}

declare module "storm:context" {
  const useStorm: () => StormContext<StormVariables>;
  const STORM_ASYNC_CONTEXT: StormContext<StormVariables>;

  export {
    useStorm,
    STORM_ASYNC_CONTEXT
  };
}

declare module "storm:event" {
  const _StormEvent: (typeof import("${path}/event"))["StormEvent"];

  class StormEvent<TEventType extends string = string, TEventData = any>
   extends _StormEvent<TEventType, TEventData> {
    /**
    * Creates a new event.
    *
    * @param type - The event type.
    * @param data - The event data.
    */
    public constructor(
      type: TEventType,
      data: TEventData
    ) {
      super(type, data);
    }
  }

  export { StormEvent };
}

`;
}
