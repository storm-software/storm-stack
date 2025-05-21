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

import { stringifyType } from "@deepkit/type";
import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { ResolvedDotenvType } from "../../../types/build";

export function generateVariables(env: ResolvedDotenvType) {
  if (!env.reflection) {
    return "{}";
  }

  return `{
${env.reflection
  .getProperties()
  .sort((a, b) => a.getNameAsString().localeCompare(b.getNameAsString()))
  .map(
    item =>
      `    ${item.getNameAsString()}${item.isActualOptional() ? "?" : ""}: ${stringifyType(item.getType())}`
  )
  .join("\n")}
}`;
}

export function generateSharedDeclarations(env: ResolvedDotenvType) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
`)}

declare global {
  const $storm: {
    vars: ${generateVariables(env)}
  }
}

export {};

 `;
}

export function generateSharedGlobal(path: string) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
`)}

declare global {
  const StormJSON: (typeof import("@stryke/json"))["StormJSON"];
  type StormJSON = import("@stryke/json").StormJSON;

  const StormURL: (typeof import("@stryke/url"))["StormURL"];
  type StormURL = import("@stryke/url").StormURL;

  const parseCookie: (typeof import("@stryke/http"))["parseCookie"];
  type parseCookie = import("@stryke/http").parseCookie;

  const parseSetCookie: (typeof import("@stryke/http"))["parseSetCookie"];
  type parseSetCookie = import("@stryke/http").parseSetCookie;

  const serializeCookie: (typeof import("@stryke/http"))["serializeCookie"];
  type serializeCookie = import("@stryke/http").serializeCookie;

  const splitSetCookieString: (typeof import("@stryke/http"))[
    "splitSetCookieString"
  ];
  type splitSetCookieString = import("@stryke/http").splitSetCookieString;

  const StormLog: (typeof import("${path}/log"))["StormLog"];
  type StormLog = import("${path}/log").StormLog;

  const uniqueId: (typeof import("${path}/id"))["uniqueId"];
  const getRandom: (typeof import("${path}/id"))["getRandom"];

  const _StormError: (typeof import("${path}/error"))["StormError"];
  class StormError extends _StormError {
    /**
     * The StormError constructor
     *
     * @param options - The options for the error
     * @param type - The type of error
     */
    public constructor(
      optionsOrMessage: StormErrorOptions | string,
      type: ErrorType = "general"
    ) {
      super(optionsOrMessage, type);
    }
  }

  const createStormError: (typeof import("${path}/error"))["createStormError"];
  const isStormError: (typeof import("${path}/error"))["isStormError"];
  const getErrorFromUnknown: (typeof import("${path}/error"))[
    "getErrorFromUnknown"
  ];

  const _StormPayload: (typeof import("${path}/payload"))["StormPayload"];
  class StormPayload<
    TData = any
  > extends _StormPayload<TData> {
    /**
     * Create a new payload object.
     *
     * @param data - The payload data.
     */
    public constructor(
      data: TData
    ) {
      super(data);
    }
  }

  const _StormResult: (typeof import("${path}/result"))["StormResult"];
  class StormResult<
    TData extends any | StormError = any | StormError
  > extends _StormResult<TData> {
    /**
     * Create a new result.
     *
     * @param payloadId - The payload identifier.
     * @param meta - The current context's metadata.
     * @param data - The result data
     */
    public constructor(
      payloadId: string,
      meta: Record<string, any>,
      data: TData
    ) {
      super(payloadId, meta, data);
    }
  }
}

export {};

`;
}

export function generateSharedModules(path: string) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
`)}


declare module "storm:init" {
  export {};
}

declare module "storm:url" {
  const StormURL: (typeof import("@stryke/url"))["StormURL"];

  export { StormURL };
}

declare module "storm:json" {
  const StormJSON: (typeof import("@stryke/json"))["StormJSON"];

  export { StormJSON };
}

declare module "storm:http" {
  const parseCookie: (typeof import("@stryke/http"))["parseCookie"];
  const parseSetCookie: (typeof import("@stryke/http"))["parseSetCookie"];
  const serializeCookie: (typeof import("@stryke/http"))["serializeCookie"];
  const splitSetCookieString: (typeof import("@stryke/http"))["splitSetCookieString"];

  export {
    parseCookie,
    parseSetCookie,
    serializeCookie,
    splitSetCookieString
  };
}

declare module "storm:storage" {
  const storage: (typeof import("${path}/storage"))["storage"];

  export { storage };
}

declare module "storm:error" {
  const _StormError: (typeof import("${path}/error"))["StormError"];

  class StormError extends _StormError {
    /**
     * The StormError constructor
     *
     * @param options - The options for the error
     * @param type - The type of error
     */
    public constructor(
      optionsOrMessage: StormErrorOptions | string,
      type: ErrorType = "general"
    ) {
      super(optionsOrMessage, type);
    }
  }

  const createStormError: (typeof import("${path}/error"))["createStormError"];
  const isStormError: (typeof import("${path}/error"))["isStormError"];
  const getErrorFromUnknown: (typeof import("${path}/error"))[
    "getErrorFromUnknown"
  ];

  export {
    StormError,
    createStormError,
    isStormError,
    getErrorFromUnknown
  };
}

declare module "storm:payload" {
  const _StormPayload: (typeof import("${path}/payload"))["StormPayload"];

  class StormPayload<
    TData = any
  > extends _StormPayload<TData> {
    /**
     * Create a new payload object.
     *
     * @param data - The payload data.
     */
    public constructor(
      data: TData
    ) {
      super(data);
    }
  }

  export { StormPayload };
}

declare module "storm:result" {
  const _StormResult: (typeof import("${path}/result"))["StormResult"];

  class StormResult<
    TData extends any | StormError = any | StormError
  > extends _StormResult<TData> {
    /**
     * Create a new result.
     *
     * @param payloadId - The payload identifier.
     * @param meta - The current context's metadata.
     * @param data - The result data
     */
    public constructor(
      payloadId: string,
      meta: Record<string, any>,
      data: TData
    ) {
      super(payloadId, meta, data);
    }
  }

  export { StormResult };
}

declare module "storm:log" {
  const StormLog: (typeof import("${path}/log"))["StormLog"];

  export { StormLog };
}

declare module "storm:id" {
  const uniqueId: (typeof import("${path}/id"))["uniqueId"];
  const getRandom: (typeof import("${path}/id"))["getRandom"];

  export { uniqueId, getRandom };
}

`;
}
