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

import { getFileHeader } from "../../../helpers/utilities";
import type {
  Context,
  Options,
  ResolvedDotenvType
} from "../../../types/build";
import { generateVariables } from "./shared";

export function generateNodeDeclarations<TOptions extends Options = Options>(
  env: ResolvedDotenvType,
  _context: Context<TOptions>
) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/types/node" />
`)}
declare global {
  const $storm: StormContext<${generateVariables(env)}>;
}

export {};
 `;
}

export function generateNodeGlobal<TOptions extends Options = Options>(
  path: string,
  _context: Context<TOptions>
) {
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

  const getBuildInfo: (typeof import("${path}/context"))["getBuildInfo"];
  const getRuntimeInfo: (typeof import("${path}/context"))["getRuntimeInfo"];
  const getEnvPaths: (typeof import("${path}/context"))["getEnvPaths"];
  const useStorm: (typeof import("${path}/context"))["useStorm"];
  const STORM_ASYNC_CONTEXT: (typeof import("${path}/context"))["STORM_ASYNC_CONTEXT"];
}

export {};

`;
}

export function generateNodeModules<TOptions extends Options = Options>(
  path: string,
  _context: Context<TOptions>
) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
/// <reference types="@storm-stack/types/node" />
`)}

declare module "storm:app" {
  const builder: (typeof import("${path}/app"))["builder"];

  export { builder };
}

declare module "storm:context" {
  const getBuildInfo: (typeof import("${path}/context"))["getBuildInfo"];
  const getRuntimeInfo: (typeof import("${path}/context"))["getRuntimeInfo"];
  const getEnvPaths: (typeof import("${path}/context"))["getEnvPaths"];
  const useStorm: (typeof import("${path}/context"))["useStorm"];
  const STORM_ASYNC_CONTEXT: (typeof import("${path}/context"))["STORM_ASYNC_CONTEXT"];

  export {
    getBuildInfo,
    getRuntimeInfo,
    getEnvPaths,
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
