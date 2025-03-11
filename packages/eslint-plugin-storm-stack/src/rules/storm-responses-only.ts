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

import type { RuleFixer } from "@typescript-eslint/utils/ts-eslint";
import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "storm-responses-only";
export type MessageIds = "stormResponsesOnly";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description:
        "Prefer usage of `StormResponse` class when using Storm Stack"
    },
    fixable: "code",
    schema: [],
    messages: {
      stormResponsesOnly:
        "When using Storm Stack, source code should use `StormResponse` instead of the base `Response` class."
    }
  },
  defaultOptions: [],
  create: context => {

    return {
      NewExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Response') {
          context.report({
            node,
            messageId: "stormResponsesOnly",
            fix(fixer: RuleFixer) {
              return fixer.replaceText(node.callee, 'StormResponse');
            }
          });
        }
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Response') {
          context.report({
            node,
            messageId: "stormResponsesOnly",
            fix(fixer: RuleFixer) {
              return fixer.replaceText(node.callee, 'StormResponse');
            }
          });
        }
      },
    };

  }
});
