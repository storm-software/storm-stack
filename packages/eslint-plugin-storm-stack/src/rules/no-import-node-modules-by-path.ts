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

export const RULE_NAME = "no-import-node-modules-by-path";
export type MessageIds = "noImportNodeModulesByPath";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent importing modules in `node_modules` folder by relative or absolute path"
    },
    schema: [],
    messages: {
      noImportNodeModulesByPath:
        "Do not import modules in `node_modules` folder by path"
    }
  },
  defaultOptions: [],
  create: context => {
    return {
      ImportDeclaration: node => {
        if (node.source.value.includes("/node_modules/")) {
          context.report({
            node,
            messageId: "noImportNodeModulesByPath"
          });
        }
      },
      'CallExpression[callee.name="require"]': (node: any) => {
        const value = node.arguments[0]?.value;
        if (typeof value === "string" && value.includes("/node_modules/")) {
          context.report({
            node,
            messageId: "noImportNodeModulesByPath"
          });
        }
      }
    };
  }
});
