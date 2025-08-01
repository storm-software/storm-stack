/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import ts, { CompilerOptions, TranspileOptions } from "typescript";

export interface IsolatedDeclarationsResult {
  code: string;
  errors: Array<string>;
  map?: string;
}

export async function isolatedDeclarations(
  id: string,
  code: string,
  transformOptions?: TranspileOptions,
  sourceMap?: boolean
): Promise<IsolatedDeclarationsResult> {
  if (!ts.transpileDeclaration) {
    return {
      code: "",
      errors: [
        "TypeScript version is too low, please upgrade to TypeScript 5.5.2+."
      ]
    };
  }

  const compilerOptions: CompilerOptions = {
    declarationMap: sourceMap,
    ...transformOptions?.compilerOptions
  };
  let { outputText, diagnostics, sourceMapText } = ts.transpileDeclaration(
    code,
    {
      fileName: id,
      reportDiagnostics: true,
      ...transformOptions,
      compilerOptions
    }
  );

  if (compilerOptions.declarationMap) {
    if (outputText.split("\n").at(-1)?.startsWith("//# sourceMappingURL=")) {
      outputText = outputText.split("\n").slice(0, -1).join("\n");
    }
  }

  const errors = diagnostics?.length
    ? [
        ts.formatDiagnostics(diagnostics, {
          getCanonicalFileName: fileName =>
            ts.sys.useCaseSensitiveFileNames
              ? fileName
              : fileName.toLowerCase(),
          getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
          getNewLine: () => ts.sys.newLine
        })
      ]
    : [];

  if (sourceMapText) {
    sourceMapText = JSON.parse(sourceMapText).mappings;
  }

  return {
    code: outputText,
    errors,
    map: sourceMapText
  };
}
