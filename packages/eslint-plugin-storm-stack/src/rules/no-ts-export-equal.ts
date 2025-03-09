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

export const RULE_NAME = "no-ts-export-equal";
export type MessageIds = "noTsExportEqual";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Do not use `exports =`"
    },
    schema: [],
    messages: {
      noTsExportEqual: "Use ESM `export default` instead"
    }
  },
  defaultOptions: [],
  create: context => {
    const extension = context.getFilename().split(".").pop();
    if (!extension) return {};
    if (!["ts", "tsx", "mts", "cts"].includes(extension)) return {};

    return {
      TSExportAssignment(node) {
        context.report({
          node,
          messageId: "noTsExportEqual"
        });
      }
    };
  }
});
