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

import {
  CallExpression,
  isCallExpression,
  isExportDeclaration,
  isImportDeclaration,
  isImportTypeNode,
  isLiteralTypeNode,
  isStringLiteral,
  Node,
  SourceFile,
  SyntaxKind,
  TransformationContext,
  TransformerFactory,
  visitEachChild,
  visitNode,
  Visitor
} from "typescript";
import { Context } from "../../types/context";

function isDynamicImport(node: Node): node is CallExpression {
  return (
    isCallExpression(node) && node.expression.kind === SyntaxKind.ImportKeyword
  );
}

export function createImportTransformer(
  context: Context
): TransformerFactory<SourceFile> {
  return (ctx: TransformationContext) => {
    return (sourceFile: SourceFile): SourceFile => {
      const visitor: Visitor = node => {
        let importPath: string | undefined;
        if (
          (isImportDeclaration(node) || isExportDeclaration(node)) &&
          node.moduleSpecifier
        ) {
          const importPathWithQuotes = node.moduleSpecifier.getText(sourceFile);
          importPath = importPathWithQuotes.substr(
            1,
            importPathWithQuotes.length - 2
          );
        } else if (isDynamicImport(node)) {
          const importPathWithQuotes = node.arguments[0]!.getText(sourceFile);
          importPath = importPathWithQuotes.substr(
            1,
            importPathWithQuotes.length - 2
          );
        } else if (
          isImportTypeNode(node) &&
          isLiteralTypeNode(node.argument) &&
          isStringLiteral(node.argument.literal)
        ) {
          importPath = node.argument.literal.text;
        }

        if (importPath) {
          const resolvedImportPath =
            context.vfs.resolvePath(importPath) || importPath;

          // Only rewrite relative path
          if (resolvedImportPath !== importPath) {
            if (isImportDeclaration(node)) {
              return ctx.factory.updateImportDeclaration(
                node,
                node.modifiers,
                node.importClause,
                ctx.factory.createStringLiteral(resolvedImportPath),
                node.attributes
              );
            } else if (isExportDeclaration(node)) {
              return ctx.factory.updateExportDeclaration(
                node,
                node.modifiers,
                node.isTypeOnly,
                node.exportClause,
                ctx.factory.createStringLiteral(resolvedImportPath),
                node.attributes
              );
            } else if (isDynamicImport(node)) {
              return ctx.factory.updateCallExpression(
                node,
                node.expression,
                node.typeArguments,
                ctx.factory.createNodeArray([
                  ctx.factory.createStringLiteral(resolvedImportPath)
                ])
              );
            } else if (isImportTypeNode(node)) {
              return ctx.factory.updateImportTypeNode(
                node,
                ctx.factory.createLiteralTypeNode(
                  ctx.factory.createStringLiteral(resolvedImportPath)
                ),
                node.attributes,
                node.qualifier,
                node.typeArguments,
                node.isTypeOf
              );
            }
          }
          return node;
        }

        return visitEachChild(node, visitor, ctx);
      };

      return visitNode(sourceFile, visitor) as SourceFile;
    };
  };
}
