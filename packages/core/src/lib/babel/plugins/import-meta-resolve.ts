/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { NodePath, PluginObj } from "@babel/core";
import type { MemberExpression } from "@babel/types";

export default function importMetaResolvePlugin(_ctx: any) {
  return <PluginObj>{
    name: "import-meta-resolve",
    visitor: {
      Program(path) {
        const metaList: Array<NodePath<MemberExpression>> = [];

        path.traverse({
          MemberExpression(memberExpPath) {
            const { node } = memberExpPath;

            if (
              node.object.type === "MetaProperty" &&
              node.object.meta.name === "import" &&
              node.object.property.name === "meta" &&
              node.property.type === "Identifier" &&
              node.property.name === "resolve"
            ) {
              metaList.push(memberExpPath);
            }
          }
        });

        if (metaList.length === 0) {
          return;
        }

        for (const meta of metaList) {
          meta.replaceWith({
            type: "ExpressionStatement",
            expression: { type: "Identifier", name: "jitiESMResolve" }
          });
        }
      }
    }
  };
}
