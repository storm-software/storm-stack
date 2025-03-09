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

import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "no-import-dist";
export type MessageIds = "noImportDist";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Prevent importing modules in `dist` folder"
    },
    schema: [],
    messages: {
      noImportDist: "Do not import modules in `dist` folder, got {{path}}"
    }
  },
  defaultOptions: [],
  create: context => {
    function isDist(path: string): boolean {
      return (
        Boolean(path.startsWith(".") && /\/dist(\/|$)/.test(path)) ||
        path === "dist"
      );
    }

    return {
      ImportDeclaration: node => {
        if (isDist(node.source.value)) {
          context.report({
            node,
            messageId: "noImportDist",
            data: {
              path: node.source.value
            }
          });
        }
      }
    };
  }
});
