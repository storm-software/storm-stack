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

import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { addImport } from "@storm-stack/core/lib/babel/module";
import { BabelPluginOptions } from "@storm-stack/core/types/babel";
import { declareBabel } from "@storm-stack/devkit/babel/declare-babel";
import { BabelPluginBuilderParams } from "@storm-stack/devkit/types";
import { NodePluginContext } from "../types/plugin";

/*
 * The Storm Stack Babel Plugin
 *
 * @param babel - The Babel core module
 * @returns The Babel plugin object
 */
export default declareBabel(
  "node",
  (_: BabelPluginBuilderParams<BabelPluginOptions, NodePluginContext>) => {
    // function requiresImport(
    //   pass: BabelPluginPass<BabelPluginOptions, NodeBabelPluginState>
    // ): boolean {
    //   return !listImports(pass.file.ast).includes("storm:context");
    // }

    return {
      visitor: {
        Identifier(path: NodePath<t.Identifier>) {
          if (path.node.name === "$storm") {
            path.replaceWith(t.callExpression(t.identifier("useStorm"), []));

            addImport(path, {
              module: "storm:context",
              name: "useStorm",
              imported: "useStorm"
            });
          }
        }
      }
    };
  }
);
