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

/* eslint-disable ts/no-unsafe-call */

import type { PluginObj } from "@babel/core";
import type { Identifier, MemberExpression, MetaProperty } from "@babel/types";

export default function importMetaEnvPlugin({ template, types }: any) {
  return <PluginObj>{
    name: "@import-meta-env/babel",
    visitor: {
      Identifier(path) {
        if (!types.isIdentifier(path)) {
          return;
        }

        // {}.{} or {}?.{} (meta.env or meta?.env)
        if (
          !types.isMemberExpression(path.parentPath) &&
          !types.isOptionalMemberExpression(path.parentPath)
        ) {
          return;
        }

        // {}.{}.{} (import.meta.env)
        if (!types.isMemberExpression(path.parentPath.node)) {
          return;
        }

        const parentNode = path.parentPath.node as MemberExpression;

        if (!types.isMetaProperty(parentNode.object)) {
          return;
        }

        const parentNodeObjMeta = parentNode.object as MetaProperty;

        if (
          parentNodeObjMeta.meta.name === "import" &&
          parentNodeObjMeta.property.name === "meta" &&
          (parentNode.property as Identifier).name === "env"
        ) {
          path.parentPath.replaceWith(template.expression.ast("process.env"));
        }
      }
    }
  };
}
