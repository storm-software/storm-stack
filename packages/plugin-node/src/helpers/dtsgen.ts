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

import { NEWLINE_STRING } from "@stryke/types/base";
import { getFileHeader } from "storm-stack/helpers";
import type { ResolvedDotenvTypeDefinitionProperty } from "storm-stack/types";
import type { StormStackNodeFeatures } from "../types/config";

export function generateDeclarations(
  env: Record<string, ResolvedDotenvTypeDefinitionProperty>,
  _features: StormStackNodeFeatures[]
) {
  return `${getFileHeader(`
/// <reference types="storm-stack/types" />
/// <reference types="@storm-stack/plugin-node/types" />
`)}
declare global {
  const $storm: StormContext<{
${Object.keys(env)
  .map(
    item => `    ${item}${env[item]?.isOptional ? "?" : ""}: ${env[item]?.text}`
  )
  .join(NEWLINE_STRING)}
  }>
}

export {};
 `;
}

export function generateImports(path: string) {
  return `${getFileHeader(`
/// <reference types="@storm-stack/plugin-node/types" />
`)}
declare global {
  const StormEvent: (typeof import("${path}/event"))["StormEvent"];

  type StormEvent<TEventType extends string = string, TData = any> =
    import("${path}/event").StormEvent<TEventType, TData>;
}

export {};
`;
}

export function generateHttpImports() {
  return `${getFileHeader()}
declare global {
  const StormURLBuilder: typeof import("@stryke/http")["StormURLBuilder"];
}

export {};
`;
}
