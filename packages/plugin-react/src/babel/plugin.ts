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
import { getImport } from "@storm-stack/core/lib/babel/module";
import { BabelPluginOptions } from "@storm-stack/core/types/babel";
import { declareBabel } from "@storm-stack/devkit/babel/declare-babel";
import { BabelPluginBuilderParams } from "@storm-stack/devkit/types";
import { ReactPluginContext } from "../types/plugin";

/*
 * The Storm Stack Babel Plugin
 *
 * @param babel - The Babel core module
 * @returns The Babel plugin object
 */
export default declareBabel(
  "react",
  (_: BabelPluginBuilderParams<BabelPluginOptions, ReactPluginContext>) => {
    // function requiresImport(
    //   pass: BabelPluginPass<BabelPluginOptions, ReactBabelPluginState>
    // ): boolean {
    //   return !listImports(pass.file.ast).includes("storm:context");
    // }

    return {
      visitor: {
        Identifier(path: NodePath<t.Identifier>) {
          if (path.node.name === "$storm") {
            path.replaceWith(t.callExpression(t.identifier("useStorm"), []));

            (
              path.scope.getProgramParent().path as NodePath<t.Program>
            ).unshiftContainer("body", getImport("storm:context", "useStorm"));
          }
        }
      }
    };
  }
);
