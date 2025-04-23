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

import { stringifyType } from "@deepkit/type";
import type { ResolvedDotenvType } from "../types/build";
import { getFileHeader } from "./utilities/file-header";

export function generateDeclarationVariables(env: ResolvedDotenvType) {
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

export function generateDeclarations(env: ResolvedDotenvType) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
`)}
declare global {
  const $storm: {
    env: ${generateDeclarationVariables(env)}
  }
}

export {};
 `;
}

export function generateImports(path: string) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/types" />
`)}
declare global {
  const StormError: (typeof import("${path}/error"))["StormError"];
  const StormJSON: (typeof import("@stryke/json"))["StormJSON"];
  const StormRequest: (typeof import("${path}/request"))["StormRequest"];
  const StormResponse: (typeof import("${path}/response"))["StormResponse"];
  const StormLog: (typeof import("${path}/log"))["StormLog"];
  const uniqueId: (typeof import("${path}/id"))["uniqueId"];
  const getRandom: (typeof import("${path}/id"))["getRandom"];

  type StormError = import("${path}/error").StormError;
  type StormRequest<TData = any> = import("${path}/request").StormRequest<TData>;
  type StormResponse = import("${path}/response").StormResponse;
  type StormLog = import("${path}/log").StormLog;
}

declare module "storm:error" {
  let _StormError: (typeof import("${path}/error"))["StormError"];
  export { _StormError as StormError };
}

declare module "storm:json" {
  let _StormJSON: (typeof import("@stryke/json"))["StormJSON"];
  export { _StormJSON as StormJSON };
}

declare module "storm:request" {
  let _StormRequest: (typeof import("${path}/request"))["StormRequest"];
  export { _StormRequest as StormRequest };
}

declare module "storm:response" {
  let _StormResponse: (typeof import("${path}/response"))["StormResponse"];
  export { _StormResponse as StormResponse };
}

declare module "storm:log" {
  let _StormLog: (typeof import("${path}/log"))["StormLog"];
  export { _StormLog as StormLog };
}

declare module "storm:id" {
  let _uniqueId: (typeof import("${path}/id"))["uniqueId"];
  let _getRandom: (typeof import("${path}/id"))["getRandom"];
  export { _uniqueId as uniqueId, _getRandom as getRandom };
}

export {};
`;
}
