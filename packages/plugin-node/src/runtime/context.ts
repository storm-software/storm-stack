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

import { getFileHeader } from "@storm-stack/core/helpers";
import type { Context, Options } from "@storm-stack/core/types";
import { StormStackNodeFeatures } from "../types/config";

export function writeContext<TOptions extends Options = Options>(
  context: Context<TOptions>,
  features: StormStackNodeFeatures[]
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
} from "@stryke/env/runtime-checks";${
    features.includes(StormStackNodeFeatures.ENV_PATHS)
      ? `
import { getEnvPaths } from "@stryke/env/get-env-paths";`
      : ""
  }
import { getContext } from "unctx";
import type {
  StormBuildInfo,
  StormContext,
  StormRuntimeInfo
} from "@storm-stack/plugin-node/types";
import { StormError } from "./error";

const STORM_CONTEXT_KEY = "storm-stack";

export const STORM_ASYNC_CONTEXT = getContext<StormContext>(STORM_CONTEXT_KEY, {
  asyncContext: true,
  AsyncLocalStorage
});

export const getBuildInfo = (): StormBuildInfo => {
  return {
    name: $storm.env.APP_NAME!,
    version: $storm.env.APP_VERSION!,
    buildId: $storm.env.BUILD_ID!,
    timestamp: $storm.env.BUILD_TIMESTAMP
      ? Number($storm.env.BUILD_TIMESTAMP)
      : 0,
    releaseId: $storm.env.RELEASE_ID!,
    mode: ($storm.env.MODE ||
      $storm.env.NODE_ENV ||
      "production") as StormBuildInfo["mode"],
    platform: ($storm.env.PLATFORM ||
      "node") as StormBuildInfo["platform"],
    isTest,
    isDebug: isDebug || isDevelopment,
    isProduction,
    isStaging,
    isDevelopment
  };
};

${
  features.includes(StormStackNodeFeatures.ENV_PATHS)
    ? `
export const envPaths = getEnvPaths({
  orgId: "${context.workspaceConfig.organization || "storm-software"}",
  appId: ${context.name ? `"${context.name}"` : "$storm.env.APP_NAME"}
});`
    : ""
}

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

export function useStorm(): StormContext {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new StormError({ type: "general", code: 12 });
  }
}
`;
}
