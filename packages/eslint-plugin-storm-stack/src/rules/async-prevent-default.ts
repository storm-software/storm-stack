/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { Scope } from "@typescript-eslint/scope-manager";
import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "async-prevent-default";
export type MessageIds = "asyncPreventDefault";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow `event.preventDefault` calls inside of async functions"
    },
    messages: {
      asyncPreventDefault:
        "event.preventDefault() inside an async function is error prone"
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    const scopeDidWait = new WeakSet();
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      AwaitExpression(node) {
        scopeDidWait.add(
          sourceCode.getScope ? sourceCode.getScope(node) : context.getScope()
        );
      },
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "preventDefault"
        ) {
          let scope = sourceCode.getScope
            ? sourceCode.getScope(node)
            : context.getScope();
          while (scope) {
            if (scopeDidWait.has(scope)) {
              context.report({
                node,
                messageId: "asyncPreventDefault"
              });
              break;
            }

            scope = scope.upper as Scope;
          }
        }
      }
    };
  }
});
