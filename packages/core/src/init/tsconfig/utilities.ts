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

import { readJsonFile } from "@stryke/fs/read-file";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import ts from "typescript";
import {
  getParsedTypeScriptConfig,
  getTsconfigFilePath
} from "../../helpers/utilities/tsconfig";
import type { Context, Options } from "../../types/build";

export async function getTsconfigChanges<TOptions extends Options = Options>(
  context: Context<TOptions>
): Promise<TsConfigJson> {
  const tsconfig = await getParsedTypeScriptConfig(context);

  const tsconfigJson = await readJsonFile<TsConfigJson>(
    getTsconfigFilePath(context)
  );
  tsconfigJson.compilerOptions ??= {};

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
  if (context.options.platform === "browser") {
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
  } else if (context.options.platform === "node") {
    if (
      !tsconfig.options.types?.some(
        type =>
          type.toLowerCase() === "node" || type.toLowerCase() === "@types/node"
      )
    ) {
      tsconfigJson.compilerOptions.types ??= [];
      tsconfigJson.compilerOptions.types.push("node");
    }
  }

  return tsconfigJson;
}
