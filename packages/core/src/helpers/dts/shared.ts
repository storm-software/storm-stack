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

import { ReflectionClass, stringifyType } from "@deepkit/type";
import { titleCase } from "@stryke/string-format/title-case";
import { getFileHeader } from "../utilities/file-header";

export function generateVariables(reflection: ReflectionClass<any>) {
  if (!reflection) {
    return "{}";
  }

  return `{
  ${generateVariablesInner(reflection)}

  [key: string]: any;
}`;
}

export function generateVariablesInner(reflection: ReflectionClass<any>) {
  if (!reflection) {
    return "";
  }

  return `
${reflection
  .getProperties()
  .filter(item => !item.isHidden() || !item.isIgnored())
  .sort((a, b) =>
    (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
      ? a.getNameAsString().localeCompare(b.getNameAsString())
      : a.isReadonly()
        ? -1
        : 1
  )
  .map(
    item =>
      `/**
     * ${item.getDescription() || item.getTitle() || titleCase(item.getNameAsString())}
     *
     * @title ${item.getTitle() || titleCase(item.getNameAsString())}${
       item.isInternal()
         ? `
     * @internal`
         : ""
     }${
       item.isReadonly()
         ? `
     * @readonly`
         : ""
     }${
       item.getDomain()
         ? `
     * @domain ${item.getDomain()}`
         : ""
     }${
       item.getPermission()?.length
         ? `
     ${item
       .getPermission()
       .map(permission => `* @permission ${permission}`)
       .join("\n")}`
         : ""
     }
     */
    ${item.getNameAsString()}${item.isActualOptional() ? "?" : ""}: ${stringifyType(item.getType())}
`
  )
  .join("\n")}`;
}

export function generateSharedDeclarations(reflection: ReflectionClass<any>) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
`)}

declare global {
  type StormVariables = ${generateVariables(reflection)};

  const $storm: {
    vars: StormVariables;
  };
}

export {};

 `;
}

export function generateSharedGlobal(path: string) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
`)}

declare global {
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
  const isError: (typeof import("${path}/error"))["isError"];
  const isStormError: (typeof import("${path}/error"))["isStormError"];

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
  const isError: (typeof import("${path}/error"))["isError"];
  const isStormError: (typeof import("${path}/error"))["isStormError"];

  export {
    StormError,
    createStormError,
    isError,
    isStormError
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
  /**
   * The StormLog class that's used for writing logs during Storm Stack applications.
   */
  class StormLog implements IStormLog {
    public readonly filters: LogFilter[];

    public lowestLogLevel: LogLevel | null;

    public constructor() {}

    public with(properties: Record<string, unknown>): IStormLog;

    public filter(record: LogRecord): boolean;

    public *sinks(level?: LogLevel): Iterable<LogSink>;

    public emit(record: LogRecord, bypassSinks?: Set<LogSink>): void;

    public log(
      level: LogLevel,
      rawMessage: string,
      properties: Record<string, unknown> | (() => Record<string, unknown>),
      bypassSinks?: Set<LogSink>
    ): void;

    public logLazily(
      level: LogLevel,
      callback: LogCallback,
      properties: Record<string, unknown> = {}
    ): void;

    public logTemplate(
      level: LogLevel,
      messageTemplate: TemplateStringsArray,
      values: unknown[],
      properties: Record<string, unknown> = {}
    ): void;

    public debug(
      message: TemplateStringsArray | string | LogCallback,
      ...values: unknown[]
    ): void;

    public info(
      message: TemplateStringsArray | string | LogCallback,
      ...values: unknown[]
    ): void;

    public warn(
      message: TemplateStringsArray | string | LogCallback,
      ...values: unknown[]
    ): void;

    public error(
      message: TemplateStringsArray | string | LogCallback | Error,
      ...values: unknown[]
    ): void;

    public fatal(
      message: TemplateStringsArray | string | LogCallback | Error,
      ...values: unknown[]
    ): void;
  }

  export { StormLog };
}

declare module "storm:id" {
  const uniqueId: (typeof import("${path}/id"))["uniqueId"];
  const getRandom: (typeof import("${path}/id"))["getRandom"];

  export { uniqueId, getRandom };
}

`;
}
