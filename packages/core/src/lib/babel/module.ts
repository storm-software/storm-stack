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

import { NodePath } from "@babel/core";
import { ParseResult } from "@babel/parser";
import * as BabelTypes from "@babel/types";
import { isString } from "@stryke/type-checks/is-string";
import { parseAst } from "./ast";

/**
 * Finds an export in the given Babel AST program by its key.
 *
 * @param ast - The parsed Babel AST result containing the program body.
 * @param key - The name of the export to find (e.g., "default" or a named export).
 * @returns The declaration of the export if found, otherwise undefined.
 */
export function findExport(ast: ParseResult<BabelTypes.File>, key: string) {
  const type =
    key === "default" ? "ExportDefaultDeclaration" : "ExportNamedDeclaration";

  for (const node of ast.program.body) {
    if (node.type === type) {
      if (key === "default") {
        return node.declaration;
      }
      if (node.declaration && "declarations" in node.declaration) {
        const declaration = node.declaration.declarations[0];
        if (
          declaration &&
          "name" in declaration.id &&
          declaration.id.name === key
        ) {
          return declaration.init as any;
        }
      }
    }
  }
}

/**
 * Lists all exports from the given Babel AST program.
 *
 * @param codeOrAst - The parsed Babel AST result containing the program body.
 * @returns An array of export names, including "default" for default exports.
 */
export function listExports(codeOrAst: ParseResult<BabelTypes.File> | string) {
  const ast = isString(codeOrAst) ? parseAst({ code: codeOrAst }) : codeOrAst;

  return ast.program.body
    .flatMap(i => {
      if (i.type === "ExportDefaultDeclaration") {
        return ["default"];
      }
      if (
        i.type === "ExportNamedDeclaration" &&
        i.declaration &&
        "declarations" in i.declaration
      ) {
        return i.declaration.declarations.map(d =>
          "name" in d.id ? d.id.name : ""
        );
      }
      return [];
    })
    .filter(Boolean);
}

/**
 * Lists all imports from the given Babel AST program.
 *
 * @param ast - The parsed Babel AST result containing the program body.
 * @returns An array of import names, including "default" for default imports.
 */
export function listImports(
  ast: ParseResult<BabelTypes.File> | BabelTypes.File
) {
  return ast.program.body
    .flatMap(i => {
      if (i.type === "ImportDeclaration") {
        return i.specifiers.map(s => {
          if (s.type === "ImportDefaultSpecifier") {
            return "default";
          }
          if (s.type === "ImportSpecifier" && "imported" in s) {
            return s.imported.type === "Identifier"
              ? s.imported.name
              : s.imported.value;
          }
          return "";
        });
      }

      return [];
    })
    .filter(Boolean);
}

export function isImportCall(
  types: typeof BabelTypes,
  calleePath: NodePath<BabelTypes.CallExpression | BabelTypes.NewExpression>
) {
  return types.isImport(calleePath.node.callee);
}

/**
 * Gets the import declaration for a given name and specifier.
 *
 * @param specifier - The specifier of the import.
 * @param name - The name of the import.
 * @param named - Optional named import.
 * @returns The import declaration.
 */
export function getImport(
  specifier: string,
  name: string,
  named?: string
): BabelTypes.ImportDeclaration {
  return BabelTypes.importDeclaration(
    [
      BabelTypes.importSpecifier(
        BabelTypes.identifier(name),
        BabelTypes.stringLiteral(named || name)
      )
    ],
    BabelTypes.stringLiteral(specifier)
  );
}
