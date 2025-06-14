/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "top-level-function";
export type MessageIds = "topLevelFunctionDeclaration";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce top-level functions to be declared with function keyword"
    },
    fixable: "code",
    schema: [],
    messages: {
      topLevelFunctionDeclaration:
        "Top-level functions should be declared with function keyword"
    }
  },
  defaultOptions: [],
  create: context => {
    return {
      VariableDeclaration(node) {
        if (
          node.parent.type !== "Program" &&
          node.parent.type !== "ExportNamedDeclaration"
        ) {
          return;
        }

        if (node.declarations.length !== 1) return;
        if (node.kind !== "const") return;
        if (node.declare) return;

        const declaration = node.declarations[0];

        if (
          declaration?.init?.type !== "ArrowFunctionExpression" &&
          declaration?.init?.type !== "FunctionExpression"
        ) {
          return;
        }
        if (declaration.id?.type !== "Identifier") return;
        if (declaration.id.typeAnnotation) return;
        if (
          declaration.init.body.type !== "BlockStatement" &&
          declaration.id?.loc.start.line === declaration.init?.body.loc.end.line
        ) {
          return;
        }

        const fnExpression = declaration.init;
        const body = declaration.init.body;
        const id = declaration.id;

        context.report({
          node,
          loc: {
            start: id.loc.start,
            end: body.loc.start
          },
          messageId: "topLevelFunctionDeclaration",
          fix(fixer) {
            const code = context.getSourceCode().text;
            const textName = code.slice(id.range[0], id.range[1]);
            const textArgs =
              fnExpression.params.length > 0
                ? code.slice(
                    fnExpression?.params?.[0]?.range[0],
                    fnExpression?.params?.at(-1)?.range[1]
                  )
                : "";
            const textBody =
              body.type === "BlockStatement"
                ? code.slice(body.range[0], body.range[1])
                : `{\n  return ${code.slice(body.range[0], body.range[1])}\n}`;
            const textGeneric = fnExpression.typeParameters
              ? code.slice(
                  fnExpression.typeParameters.range[0],
                  fnExpression.typeParameters.range[1]
                )
              : "";
            const textTypeReturn = fnExpression.returnType
              ? code.slice(
                  fnExpression.returnType.range[0],
                  fnExpression.returnType.range[1]
                )
              : "";
            const textAsync = fnExpression.async ? "async " : "";

            const final = `${textAsync}function ${textName} ${textGeneric}(${textArgs})${textTypeReturn} ${textBody}`;

            // console.log({
            //   input: code.slice(node.range[0], node.range[1]),
            //   output: final,
            // })
            return fixer.replaceTextRange(
              [node.range[0], node.range[1]],
              final
            );
          }
        });
      }
    };
  }
});
