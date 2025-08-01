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

import type { GeneratorOptions, GeneratorResult } from "@babel/generator";
import _generate from "@babel/generator";
import type { ParseResult, ParserOptions } from "@babel/parser";
import { parse } from "@babel/parser";
import type * as t from "@babel/types";

export type ParseAstOptions = ParserOptions & {
  code: string;
};

/**
 * Parse the given code into an AST.
 *
 * @param code - The code to parse.
 * @param opts - The options for parsing.
 * @returns The parsed AST.
 */
export function parseAst(
  code,
  opts: Omit<ParseAstOptions, "code"> = {}
): ParseResult<t.File> {
  return parse(code, {
    plugins: ["typescript"],
    sourceType: "module",
    allowImportExportEverywhere: true,
    allowAwaitOutsideFunction: true,
    ...opts
  });
}

let generate = _generate;
if ("default" in generate) {
  generate = generate.default as typeof generate;
}

type GenerateFromAstOptions = GeneratorOptions &
  Required<Pick<GeneratorOptions, "sourceFileName" | "filename">>;
export function generateFromAst(
  ast: t.Node,
  opts?: GenerateFromAstOptions
): GeneratorResult {
  return generate(
    ast,
    opts
      ? { importAttributesKeyword: "with", sourceMaps: true, ...opts }
      : undefined
  );
}

export type { GeneratorResult } from "@babel/generator";
