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

import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "if-newline";
export type MessageIds = "missingIfNewline";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "layout",
    docs: {
      description: "Newline after if"
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      missingIfNewline: "Expect newline after if"
    }
  },
  defaultOptions: [],
  create: context => {
    return {
      IfStatement(node) {
        if (!node.consequent) return;
        if (node.consequent.type === "BlockStatement") return;
        if (node.test.loc.end.line === node.consequent.loc.start.line) {
          context.report({
            node,
            loc: {
              start: node.test.loc.end,
              end: node.consequent.loc.start
            },
            messageId: "missingIfNewline",
            fix(fixer) {
              return fixer.replaceTextRange(
                [node.consequent.range[0], node.consequent.range[0]],
                "\n"
              );
            }
          });
        }
      }
    };
  }
});
