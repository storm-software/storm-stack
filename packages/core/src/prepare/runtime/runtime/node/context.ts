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

import { getFileHeader } from "../../../../helpers/utilities/file-header";
import type { Context, Options } from "../../../../types/build";

export function writeContext<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `${getFileHeader()}

import { AsyncLocalStorage } from "node:async_hooks";
import { isCI, isInteractive } from "@stryke/env/ci-checks";
import {
  hasTTY,
  isColorSupported,
  isDebug,
  isDevelopment,
  isLinux,
  isMacOS,
  isMinimal,
  isProduction,
  isStaging,
  isTest,
  isWindows,
  nodeMajorVersion,
  nodeVersion
} from "@stryke/env/environment-checks";
import { providerInfo } from "@stryke/env/providers";
import {
  runtimeInfo as baseRuntimeInfo,
  isBun,
  isDeno,
  isEdgeLight,
  isFastly,
  isNetlify,
  isNode,
  isWorkerd
} from "@stryke/env/runtime-checks";
import { getEnvPaths as _getEnvPaths, EnvPaths } from "@stryke/env/get-env-paths";
import { getContext } from "unctx";
import type {
  StormBuildInfo,
  StormContext,
  StormRuntimeInfo
} from "@storm-stack/types/node";
import { StormError } from "./error";

const STORM_CONTEXT_KEY = "storm-stack";

export const STORM_ASYNC_CONTEXT = getContext<StormContext>(STORM_CONTEXT_KEY, {
  asyncContext: true,
  AsyncLocalStorage
});

/**
 * Get the build information for the current application.
 *
 * @returns The build information for the current application.
 */
export function getBuildInfo(): StormBuildInfo {
  return {
    name: $storm.vars.APP_NAME!,
    packageName: "${context.packageJson?.name || context.options.name}",
    version: $storm.vars.APP_VERSION!,
    buildId: $storm.vars.BUILD_ID!,
    timestamp: $storm.vars.BUILD_TIMESTAMP
      ? Number($storm.vars.BUILD_TIMESTAMP)
      : 0,
    releaseId: $storm.vars.RELEASE_ID!,
    mode: ($storm.vars.MODE ||
      $storm.vars.NODE_ENV ||
      "production") as StormBuildInfo["mode"],
    platform: ($storm.vars.PLATFORM ||
      "node") as StormBuildInfo["platform"],
    isTest,
    isDebug: isDebug || isDevelopment,
    isProduction,
    isStaging,
    isDevelopment
  };
};

let _envPaths!: EnvPaths;

/**
 * Get the environment paths for the current application.
 *
 * @returns The environment paths for the current application.
 */
export function getEnvPaths(): EnvPaths {
  if (!_envPaths) {
    _envPaths = _getEnvPaths({
      orgId: "${context.workspaceConfig?.organization || "storm-software"}",
      appId: ${context.options.name ? `"${context.options.name}"` : "$storm.vars.APP_NAME"}
    });
  }

  return _envPaths;
}

/**
 * Get the runtime information for the current application.
 *
 * @returns The runtime information for the current application.
 */
export function getRuntimeInfo(): StormRuntimeInfo {
  return {
    ...baseRuntimeInfo,
    isNode,
    isBun,
    isDeno,
    isFastly,
    isNetlify,
    isEdgeLight,
    isWorkerd,
    hasTTY,
    isWindows,
    isLinux,
    isMacOS,
    isCI: isCI(),
    isInteractive: isInteractive(),
    isMinimal,
    isColorSupported,
    isServer:
      isNode ||
      isDeno ||
      isBun ||
      isEdgeLight ||
      isFastly ||
      isNetlify ||
      isWorkerd,
    nodeVersion,
    nodeMajorVersion,
    provider: providerInfo
  };
};

/**
 * Get the Storm context for the current application.
 *
 * @returns The Storm context for the current application.
 * @throws {StormError} If the Storm context is not available.
 */
export function useStorm(): StormContext {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new StormError({ type: "general", code: 12 });
  }
}

`;
}
