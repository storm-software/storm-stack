/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { getFileHeader } from "storm-stack/helpers";

export function writeContext() {
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
import { getContext } from "unctx";
import type {
  StormBuildInfo,
  StormContext,
  StormRuntimeInfo
} from "@storm-stack/plugin-node/types";

const STORM_CONTEXT_KEY = "storm-stack";

export const STORM_ASYNC_CONTEXT = getContext<StormContext>(STORM_CONTEXT_KEY, {
  asyncContext: true,
  AsyncLocalStorage
});

export const getBuildInfo = (): StormBuildInfo => {
  return {
    buildId: process.env.STORM_BUILD_ID!,
    timestamp: process.env.STORM_BUILD_TIMESTAMP
      ? Number(process.env.STORM_BUILD_TIMESTAMP)
      : 0,
    releaseId: process.env.STORM_RELEASE_ID!,
    mode: (process.env.STORM_MODE ||
      process.env.NODE_ENV ||
      "production") as StormBuildInfo["mode"],
    platform: (process.env.STORM_PLATFORM ||
      "node") as StormBuildInfo["platform"],
    isTest,
    isDebug: isDebug || isDevelopment,
    isProduction,
    isStaging,
    isDevelopment
  };
};

export const getRuntimeInfo = (): StormRuntimeInfo => {
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

export const getAppName = () => {
  const appName = process.env.STORM_APP_NAME || process.env.APP_NAME;
  if (!appName) {
    throw new Error("App name is not defined.");
  }

  return appName;
};

export const getAppVersion = () => {
  return process.env.STORM_APP_VERSION || process.env.APP_VERSION;
};

export function useStorm(): StormContext {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new Error("useStorm is not available in this environment.");
  }
}
`;
}
