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

import { NEWLINE_STRING } from "@stryke/types/utility-types/base";
import type { ResolvedDotenvTypeDefinitionProperty } from "../types/build";
import { getFileHeader } from "./utilities/file-header";

export function generateDeclarations(
  env: Record<string, ResolvedDotenvTypeDefinitionProperty>
) {
  return `${getFileHeader(`
/// <reference types="storm-stack/types" />
`)}
declare global {
  const $storm: {
    env: {
${Object.keys(env)
  .map(
    item => `    ${item}${env[item]?.isOptional ? "?" : ""}: ${env[item]?.text}`
  )
  .join(NEWLINE_STRING)}
    }
  }
}

export {};
 `;
}

export function generateImports(path: string) {
  return `${getFileHeader(`
/// <reference types="storm-stack/types" />
`)}
declare global {
  const StormError: (typeof import("${path}/error"))["StormError"];
  const StormJSON: (typeof import("@stryke/json"))["StormJSON"];
  const StormRequest: (typeof import("${path}/request"))["StormRequest"];
  const StormResponse: (typeof import("${path}/response"))["StormResponse"];
  const StormLog: (typeof import("${path}/log"))["StormLog"];

  type StormError = import("${path}/error").StormError;
  type StormRequest<TData = any> = import("${path}/request").StormRequest<TData>;
  type StormResponse = import("${path}/response").StormResponse;
  type StormLog = import("${path}/log").StormLog;
}

export {};
`;
}
