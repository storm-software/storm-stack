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

  const _StormRequest: (typeof import("${path}/request"))["StormRequest"];
  class StormRequest<
    TData = any,
    TIdentifiers extends Record<string, any> = Record<string, any>,
    TParams extends Record<string, any> = Record<string, any>,
    TMeta extends Record<string, any> = Record<string, any>
  > extends _StormRequest<TData, TIdentifiers, TParams, TMeta> {
    /**
     * Create a new request object.
     *
     * @param data - The request data.
     * @param meta - The request metadata.
     * @param params - The request parameters.
     * @param identifiers - The request identifiers.
     */
    public constructor(
      data: TData,
      meta = {},
      params?: TParams,
      identifiers?: TIdentifiers
    ) {
      super(data, meta, params, identifiers);
    }
  }

  const _StormResponse: (typeof import("${path}/response"))["StormResponse"];
  class StormResponse<
    TData extends any | StormError = any | StormError
  > extends _StormResponse<TData> {
    /**
     * Create a new response.
     *
     * @param requestId - The request identifier.
     * @param meta - The current context's metadata.
     * @param data - The response data
     */
    public constructor(
      requestId: string,
      meta: Record<string, any>,
      data: TData
    ) {
      super(requestId, meta, data);
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

  export { parseCookie, parseSetCookie, serializeCookie, splitSetCookieString };
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

  export { StormError, createStormError, isStormError, getErrorFromUnknown };
}

declare module "storm:request" {
  const _StormRequest: (typeof import("${path}/request"))["StormRequest"];

  class StormRequest<
    TData = any,
    TIdentifiers extends Record<string, any> = Record<string, any>,
    TParams extends Record<string, any> = Record<string, any>,
    TMeta extends Record<string, any> = Record<string, any>
  > extends _StormRequest<TData, TIdentifiers, TParams, TMeta> {
    /**
     * Create a new request object.
     *
     * @param data - The request data.
     * @param meta - The request metadata.
     * @param params - The request parameters.
     * @param identifiers - The request identifiers.
     */
    public constructor(
      data: TData,
      meta = {},
      params?: TParams,
      identifiers?: TIdentifiers
    ) {
      super(data, meta, params, identifiers);
    }
  }

  export { StormRequest };
}

declare module "storm:response" {
  const _StormResponse: (typeof import("${path}/response"))["StormResponse"];

  class StormResponse<
    TData extends any | StormError = any | StormError
  > extends _StormResponse<TData> {
    /**
     * Create a new response.
     *
     * @param requestId - The request identifier.
     * @param meta - The current context's metadata.
     * @param data - The response data
     */
    public constructor(
      requestId: string,
      meta: Record<string, any>,
      data: TData
    ) {
      super(requestId, meta, data);
    }
  }

  export { StormResponse };
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
