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

import { readJsonFile } from "@stryke/fs/read-file";
import { deepClone } from "@stryke/helpers/deep-clone";
import { existsSync, joinPaths } from "@stryke/path";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import ts from "typescript";
import type { Options, ResolvedTsConfig } from "../types";

export function getTsconfigFilePath(options: Options): string {
  const tsconfigFilePath =
    options.tsconfig || joinPaths(options.projectRoot, "tsconfig.json");
  if (!existsSync(tsconfigFilePath)) {
    throw new Error(
      `Cannot find the \`tsconfig.json\` configuration file at ${tsconfigFilePath}`
    );
  }

  return tsconfigFilePath;
}

export async function getParsedTypeScriptConfig(
  options: Options
): Promise<ResolvedTsConfig> {
  const tsconfigFilePath = getTsconfigFilePath(options);

  let tsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);
  if (options.tsconfigRaw) {
    // Merge the compiler options
    tsconfigJson = defu(tsconfigJson, options.tsconfigRaw);
  }

  const tsconfig = ts.parseJsonConfigFileContent(
    tsconfigJson,
    ts.sys,
    options.projectRoot
  );
  if (tsconfig.errors.length > 0) {
    const errorMessage = `Cannot parse the compiler options provided in the \`tsconfigRaw\` option. Please investigate the following issues:
${tsconfig.errors.map(error => `- ${(error.category !== undefined && error.code ? `[${error.category}-${error.code}]: ` : "") + error.messageText.toString()}`).join("\n")}
      `;

    throw new Error(errorMessage);
  }

  return { ...tsconfig, tsconfigJson };
}

export async function getTsconfigChanges(
  options: Options
): Promise<TsConfigJson> {
  const tsconfig = await getParsedTypeScriptConfig(options);
  const tsconfigJson = await readJsonFile<TsConfigJson>(options.tsconfig!);
  tsconfigJson.compilerOptions ??= {};

  const originalTsconfigJson = deepClone(tsconfigJson) as TsConfigJson;
  originalTsconfigJson.compilerOptions ??= {};

  if (tsconfigJson.reflection !== true) {
    tsconfigJson.reflection = true;
  }

  if (tsconfig.options.experimentalDecorators !== true) {
    tsconfigJson.compilerOptions.experimentalDecorators = true;
  }

  if (tsconfig.options.emitDecoratorMetadata !== true) {
    tsconfigJson.compilerOptions.emitDecoratorMetadata = true;
  }

  // if (
  //   !tsconfig.options.types?.some(
  //     type => type.toLowerCase() === "@storm-stack/types"
  //   )
  // ) {
  //   tsconfigJson.compilerOptions.types ??= [];
  //   tsconfigJson.compilerOptions.types.push("@storm-stack/types");
  // }

  if (
    !tsconfig.options.lib?.some(
      lib =>
        lib.toLowerCase() !== "esnext" &&
        lib.toLowerCase() !== "es2021" &&
        lib.toLowerCase() !== "es2022" &&
        lib.toLowerCase() !== "es2023"
    )
  ) {
    tsconfigJson.compilerOptions.lib ??= [];
    tsconfigJson.compilerOptions.lib.push("esnext");
  }

  if (tsconfig.options.module !== ts.ModuleKind.ESNext) {
    tsconfigJson.compilerOptions.module = "ESNext";
  }

  if (
    !tsconfig.options.target ||
    ![
      ts.ScriptTarget.ESNext,
      ts.ScriptTarget.ES2024,
      ts.ScriptTarget.ES2023,
      ts.ScriptTarget.ES2022,
      ts.ScriptTarget.ES2021
    ].includes(tsconfig.options.target)
  ) {
    tsconfigJson.compilerOptions.target = "ESNext";
  }

  if (tsconfig.options.moduleResolution !== ts.ModuleResolutionKind.Bundler) {
    tsconfigJson.compilerOptions.moduleResolution = "Bundler";
  }

  if (tsconfig.options.moduleDetection !== ts.ModuleDetectionKind.Force) {
    tsconfigJson.compilerOptions.moduleDetection = "force";
  }

  if (tsconfig.options.allowSyntheticDefaultImports !== true) {
    tsconfigJson.compilerOptions.allowSyntheticDefaultImports = true;
  }

  if (tsconfig.options.noImplicitOverride !== true) {
    tsconfigJson.compilerOptions.noImplicitOverride = true;
  }

  if (tsconfig.options.noUncheckedIndexedAccess !== true) {
    tsconfigJson.compilerOptions.noUncheckedIndexedAccess = true;
  }

  if (tsconfig.options.skipLibCheck !== true) {
    tsconfigJson.compilerOptions.skipLibCheck = true;
  }

  if (tsconfig.options.resolveJsonModule !== true) {
    tsconfigJson.compilerOptions.resolveJsonModule = true;
  }

  if (tsconfig.options.isolatedModules !== true) {
    tsconfigJson.compilerOptions.isolatedModules = true;
  }

  if (tsconfig.options.verbatimModuleSyntax !== false) {
    tsconfigJson.compilerOptions.verbatimModuleSyntax = false;
  }

  if (tsconfig.options.allowJs !== true) {
    tsconfigJson.compilerOptions.allowJs = true;
  }

  if (tsconfig.options.esModuleInterop !== true) {
    tsconfigJson.compilerOptions.esModuleInterop = true;
  }

  if (tsconfig.options.declaration !== true) {
    tsconfigJson.compilerOptions.declaration = true;
  }

  // Browser platform
  if (options.platform === "browser") {
    if (tsconfig.options.jsx !== ts.JsxEmit.ReactJSX) {
      tsconfigJson.compilerOptions.jsx = "react-jsx";
    }

    if (!tsconfig.options.lib?.some(lib => lib.toLowerCase() !== "dom")) {
      tsconfigJson.compilerOptions.lib ??= [];
      tsconfigJson.compilerOptions.lib.push("dom");
    }

    if (
      !tsconfig.options.lib?.some(lib => lib.toLowerCase() !== "dom.iterable")
    ) {
      tsconfigJson.compilerOptions.lib ??= [];
      tsconfigJson.compilerOptions.lib.push("dom.iterable");
    }
  }

  // Worker platform
  // if (options.platform === "worker") {
  //   if (!tsconfig.options.types?.some(type => type.toLowerCase().includes("node"))) {
  //     tsconfigJson.compilerOptions.types ??= [];
  //     tsconfigJson.compilerOptions.types.push("node");
  //     changes.push({
  //       previous: StormJSON.stringify(
  //         originalTsconfigJson.compilerOptions.types
  //       ),
  //       current: StormJSON.stringify(tsconfigJson.compilerOptions.types),
  //       description: 'Added "node" to compilerOptions.types'
  //     });
  //   }

  //   if (
  //     !tsconfig.options.types?.some(type =>
  //       type.toLowerCase().includes("@cloudflare/workers-types")
  //     )
  //   ) {
  //     tsconfigJson.compilerOptions.types ??= [];
  //     tsconfigJson.compilerOptions.types.push("@cloudflare/workers-types");
  //     changes.push({
  //       previous: StormJSON.stringify(
  //         originalTsconfigJson.compilerOptions.types
  //       ),
  //       current: StormJSON.stringify(tsconfigJson.compilerOptions.types),
  //       description:
  //         'Added "@cloudflare/workers-types" to compilerOptions.types'
  //     });
  //   }
  // }

  return tsconfigJson;
}
