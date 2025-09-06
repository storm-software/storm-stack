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
import * as t from "@babel/types";
import { isString } from "@stryke/type-checks/is-string";
import { ImportSpecifier } from "../../types/babel";
import { parseAst } from "./ast";

/**
 * Finds an export in the given Babel AST program by its key.
 *
 * @param ast - The parsed Babel AST result containing the program body.
 * @param key - The name of the export to find (e.g., "default" or a named export).
 * @returns The declaration of the export if found, otherwise undefined.
 */
export function findExport(ast: ParseResult<t.File>, key: string) {
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
export function listExports(codeOrAst: ParseResult<t.File> | string) {
  const ast = isString(codeOrAst) ? parseAst(codeOrAst) : codeOrAst;

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
export function listImports(ast: ParseResult<t.File> | t.File) {
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
  calleePath: NodePath<t.CallExpression | t.NewExpression>
) {
  return t.isImport(calleePath.node.callee);
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
): t.ImportDeclaration {
  return t.importDeclaration(
    [t.importSpecifier(t.identifier(name), t.stringLiteral(named || name))],
    t.stringLiteral(specifier)
  );
}

/**
 * Adds an import to the program if it doesn't already exist.
 *
 * @param path - The current NodePath in the AST.
 * @param specifier - The import specifier.
 */
export function addImport(path: NodePath<any>, specifier: ImportSpecifier) {
  addImportsToProgram(
    path.scope.getProgramParent().path as NodePath<t.Program>,
    specifier
  );
}

/*
 * Matches `import { ... } from <moduleName>;`
 * but not `import * as React from <moduleName>;`
 *         `import type { Foo } from <moduleName>;`
 */
function isNonNamespacedImport(
  importDeclPath: NodePath<t.ImportDeclaration>
): boolean {
  return (
    importDeclPath
      .get("specifiers")
      .filter(Boolean)
      .every(specifier => specifier?.isImportSpecifier()) &&
    importDeclPath.node.importKind !== "type" &&
    importDeclPath.node.importKind !== "typeof"
  );
}

function getExistingImports(
  program: NodePath<t.Program>
): Map<string, NodePath<t.ImportDeclaration>> {
  const existingImports = new Map<string, NodePath<t.ImportDeclaration>>();
  program.traverse({
    ImportDeclaration(path) {
      if (isNonNamespacedImport(path)) {
        existingImports.set(path.node.source.value, path);
      }
    }
  });
  return existingImports;
}

export function addImportsToProgram(
  path: NodePath<t.Program>,
  specifier: ImportSpecifier
): void {
  const existingImports = getExistingImports(path);

  /**
   * If an existing import of this module exists (ie \`import \{ ... \} from
   * '<moduleName>'\`), inject new imported specifiers into the list of
   * destructured variables.
   */
  if (!existingImports.get(specifier.module)) {
    path.unshiftContainer(
      "body",
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier(specifier.name || specifier.imported),
            t.identifier(specifier.imported)
          )
        ],
        t.stringLiteral(specifier.module)
      )
    );
  }
}
