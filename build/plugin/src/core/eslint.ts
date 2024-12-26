/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import type { Import } from "unimport";
import type { ESLint, ESLintGlobalsPropValue } from "../types";

function getESLintGlobals(
  imports: Import[],
  eslint: ESLint,
  globals: Record<string, ESLintGlobalsPropValue> = {}
): Record<string, ESLintGlobalsPropValue> {
  const eslintGlobals: Record<string, ESLintGlobalsPropValue> = {};

  for (const name of imports
    .map(i => i.as ?? i.name)
    .filter(Boolean)
    .sort()) {
    eslintGlobals[name] = eslint.globalsPropValue || "readonly";
  }

  for (const name of Object.keys(globals).filter(Boolean).sort()) {
    eslintGlobals[name] = globals[name] || "readonly";
  }

  return eslintGlobals;
}

export function generateESLintrcConfigs(
  imports: Import[],
  eslint: ESLint,
  globals: Record<string, ESLintGlobalsPropValue> = {}
) {
  let exportStatement = "export default";
  if (
    eslint.eslintrcFilepath?.endsWith(".cjs") ||
    eslint.eslintrcFilepath?.endsWith(".cts")
  ) {
    exportStatement = "module.exports =";
  }

  return `
// Generated by unplugin-storm-stack

${exportStatement} ${JSON.stringify(
    { globals: getESLintGlobals(imports, eslint, globals) },
    null,
    2
  )}

`;
}

export function generateESLintFlatConfigs(imports: Import[], eslint: ESLint) {
  let exportStatement = "export default";
  if (
    eslint.eslintFlatFilepath?.endsWith(".cjs") ||
    eslint.eslintFlatFilepath?.endsWith(".cts")
  ) {
    exportStatement = "module.exports =";
  }

  const presetOptions = eslint.presetOptions ?? {};
  presetOptions.name ??= "storm-stack";
  presetOptions.globals = getESLintGlobals(
    imports,
    eslint,
    presetOptions.globals
  );

  const userConfigs = eslint.userConfigs ?? [];

  return `
// Generated by @storm-stack/build-plugin

import { getStormConfig } from "@storm-software/eslint";

${exportStatement} getStormConfig(${JSON.stringify(presetOptions, null, 2)}${userConfigs.length > 0 ? `, ${userConfigs.map(userConfig => JSON.stringify(userConfig, null, 2)).join(", ")}` : ""});

`;
}
