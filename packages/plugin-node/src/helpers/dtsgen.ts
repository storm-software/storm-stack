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

import { generateDeclarationVariables } from "@storm-stack/core/helpers/dtsgen";
import { getFileHeader } from "@storm-stack/core/helpers/utilities";
import type { ResolvedDotenvType } from "@storm-stack/core/types";
import { StormStackNodeFeatures } from "../types/config";

export function generateDeclarations(
  env: ResolvedDotenvType,
  features: StormStackNodeFeatures[]
) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/plugin-node/types" />
`)}
declare global {
  const $storm: StormContext<${generateDeclarationVariables(env)}${
    features.includes(StormStackNodeFeatures.ENV_PATHS)
      ? `, {
      /**
       * The environment paths for the Storm application.
       */
      readonly paths: EnvPaths;
    }`
      : ""
  }>;
}

export {};
 `;
}

export function generateGlobal(
  path: string,
  features: StormStackNodeFeatures[]
) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/plugin-node/types" />
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

  const getBuildInfo: (typeof import("${path}/context"))["getBuildInfo"];
  const getRuntimeInfo: (typeof import("${path}/context"))["getRuntimeInfo"];${
    features.includes(StormStackNodeFeatures.ENV_PATHS)
      ? `
  const envPaths: (typeof import("${path}/context"))["envPaths"];`
      : ""
  }
  const useStorm: (typeof import("${path}/context"))["useStorm"];
  const STORM_ASYNC_CONTEXT: (typeof import("${path}/context"))["STORM_ASYNC_CONTEXT"];
}

export {};

`;
}

export function generateImports(
  path: string,
  features: StormStackNodeFeatures[]
) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/plugin-node/types" />
`)}

declare module "storm:init" {
  export {};
}

declare module "storm:app" {
  const builder: (typeof import("${path}/app"))["builder"];
  export { builder };
}

declare module "storm:context" {
  const getBuildInfo: (typeof import("${path}/context"))["getBuildInfo"];
  const getRuntimeInfo: (typeof import("${path}/context"))["getRuntimeInfo"];${
    features.includes(StormStackNodeFeatures.ENV_PATHS)
      ? `
  const envPaths: (typeof import("${path}/context"))["envPaths"];`
      : ""
  }
  const useStorm: (typeof import("${path}/context"))["useStorm"];
  const STORM_ASYNC_CONTEXT: (typeof import("${path}/context"))["STORM_ASYNC_CONTEXT"];

  export {${
    features.includes(StormStackNodeFeatures.ENV_PATHS)
      ? `
    envPaths,`
      : ""
  }
    getBuildInfo,
    getRuntimeInfo,
    useStorm,
    STORM_ASYNC_CONTEXT
  };
}

declare module "storm:storage" {
  const storage: (typeof import("${path}/storage"))["storage"];
  export { storage };
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
