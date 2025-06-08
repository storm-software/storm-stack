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

export const RULE_NAME = "storm-json-only";
export type MessageIds = "stormJSONOnly";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Prefer usage of `StormJSON` class when using Storm Stack"
    },
    fixable: "code",
    schema: [],
    messages: {
      stormJSONOnly:
        "When using Storm Stack, source code should use `StormJSON` instead of the base `JSON` class."
    }
  },
  defaultOptions: [],
  create: context => {
    return {
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "JSON") {
          context.report({
            node,
            messageId: "stormJSONOnly",
            fix(fixer: RuleFixer) {
              return fixer.replaceText(node.callee, "StormJSON");
            }
          });
        }
      }
    };
  }
});
