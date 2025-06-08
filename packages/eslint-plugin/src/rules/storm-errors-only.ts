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

import type { RuleFixer } from "@typescript-eslint/utils/ts-eslint";
import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "storm-errors-only";
export type MessageIds = "stormErrorsOnly";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Prefer usage of `StormError` class when using Storm Stack"
    },
    fixable: "code",
    schema: [],
    messages: {
      stormErrorsOnly:
        "When using Storm Stack, source code should use `StormError` instead of the base `Error` class."
    }
  },
  defaultOptions: [],
  create: context => {
    return {
      NewExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "Error") {
          context.report({
            node,
            messageId: "stormErrorsOnly",
            fix(fixer: RuleFixer) {
              return fixer.replaceText(node.callee, "StormError");
            }
          });
        }
      },
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "Error") {
          context.report({
            node,
            messageId: "stormErrorsOnly",
            fix(fixer: RuleFixer) {
              return fixer.replaceText(node.callee, "StormError");
            }
          });
        }
      }
    };
  }
});
