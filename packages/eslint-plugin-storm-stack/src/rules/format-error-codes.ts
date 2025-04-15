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

import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import type { RuleFixer } from "@typescript-eslint/utils/ts-eslint";
import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "format-error-codes";
export type MessageIds = "invalidErrorFormat";
export type Options = [];

// function nodeToErrorTemplate(node) {
//   if (node.type === "Literal" && typeof node.value === "string") {
//     return node.value;
//   } else if (node.type === "BinaryExpression" && node.operator === "+") {
//     const l = nodeToErrorTemplate(node.left);
//     const r = nodeToErrorTemplate(node.right);

//     return l + r;
//   } else if (node.type === "TemplateLiteral") {
//     const elements = [];
//     for (let i = 0; i < node.quasis.length; i++) {
//       const elementNode = node.quasis[i];
//       if (elementNode.type !== "TemplateElement") {
//         throw new Error(`Unsupported type ${node.type}`);
//       }
//       elements.push(elementNode.value.cooked);
//     }
//     return elements.join("%s");
//   } else {
//     return "%s";
//   }
// }

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description:
        "Error messages should exist in a JSON file that's shared across the workspace when using Storm Stack"
    },
    fixable: "code",
    schema: [],
    messages: {
      invalidErrorFormat:
        "When using Storm Stack, Error messages should exist in a JSON file that's shared across the workspace."
    }
  },
  defaultOptions: [],
  create: context => {
    return {
      NewExpression(node) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          (node.callee.name === "Error" || node.callee.name === "StormError") &&
          node.arguments.length > 0 &&
          node.arguments[0]
        ) {
          const firstArg = node.arguments[0];
          if (firstArg?.type === AST_NODE_TYPES.Literal) {
            context.report({
              node,
              messageId: "invalidErrorFormat",
              fix(fixer: RuleFixer) {
                return fixer.replaceText(
                  node,
                  `new StormError({ type: "general", code: ${firstArg.value} })`
                );
              }
            });
          } else if (
            node.arguments[0]?.type === AST_NODE_TYPES.TemplateLiteral
          ) {
            context.report({
              node,
              messageId: "invalidErrorFormat",
              fix(fixer: RuleFixer) {
                return fixer.replaceText(
                  node,
                  `new StormError({ type: "general", code: 0 })`
                );
              }
            });
          }
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          (node.callee.name === "Error" || node.callee.name === "StormError")
        ) {
          context.report({
            node,
            messageId: "invalidErrorFormat",
            fix(fixer: RuleFixer) {
              return fixer.replaceText(node.callee, "StormError");
            }
          });
        }
      }
    };
  }
});
