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

import { NodePath, PluginAPI, PluginPass } from "@babel/core";
import { declare } from "@babel/helper-plugin-utils";
import template from "@babel/template";
import * as BabelTypes from "@babel/types";
import { toArray } from "@stryke/convert";
import { BabelPluginOptions } from "../../../types/babel";

/**
 * Generate a helper that will explicitly set up the prototype chain manually
 * for each constructed instance.
 */
const buildHelper = template(`
    function HELPER(cls){
        function ExtendableBuiltin(){
            // Not passing "newTarget" because core-js would fall back to non-exotic
            // object creation.
            var instance = Reflect.construct(cls, Array.from(arguments));
            Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
            return instance;
        }
        ExtendableBuiltin.prototype = Object.create(cls.prototype, {
            constructor: {
                value: cls,
                enumerable: false,
                writable: true,
                configurable: true,
            },
        });
        if (Object.setPrototypeOf){
            Object.setPrototypeOf(ExtendableBuiltin, cls);
        } else {
            ExtendableBuiltin.__proto__ = cls;
        }

        return ExtendableBuiltin;
    }
`);

/**
 * Generate a helper that will approximate extending builtins with simple
 * ES5-style inheritance.
 *
 * This is essentially the behavior that was the default in Babel 5.
 */
const buildHelperApproximate = template(`
    function HELPER(cls){
        function ExtendableBuiltin(){
            cls.apply(this, arguments);
        }
        ExtendableBuiltin.prototype = Object.create(cls.prototype, {
            constructor: {
                value: cls,
                enumerable: false,
                writable: true,
                configurable: true,
            },
        });
        if (Object.setPrototypeOf){
            Object.setPrototypeOf(ExtendableBuiltin, cls);
        } else {
            ExtendableBuiltin.__proto__ = cls;
        }

        return ExtendableBuiltin;
    }
`);

type BuiltinExtendPluginOptions = BabelPluginOptions & {
  /**
   * The names of the built-in classes that should be extended.
   *
   * @remarks
   * This is used to determine which classes should be transformed.
   *
   * @defaultValue ["Error"]
   */
  globals?: string[];

  /**
   * Whether to use the approximate behavior of extending built-ins.
   *
   * @remarks
   * This is used to determine whether to use the approximate helper or the full helper.
   *
   * @defaultValue true
   */
  approximate?: boolean;
};

export const BuiltinExtendPlugin = declare<
  PluginPass<BuiltinExtendPluginOptions>,
  BuiltinExtendPluginOptions
>((api: PluginAPI, options: BuiltinExtendPluginOptions) => {
  return {
    name: "storm-stack:builtin-extend",
    visitor: {
      Class(
        path: NodePath<BabelTypes.ClassDeclaration | BabelTypes.ClassExpression>
      ) {
        const globals = toArray(options.globals);
        if (!globals.includes("Error")) {
          globals.push("Error");
        }

        const superClass = path.get("superClass");
        if (
          !superClass.node ||
          !globals.some(name => superClass.isIdentifier({ name }))
        ) {
          return;
        }

        if (
          path.scope.hasBinding(
            (superClass.node as BabelTypes.Identifier)?.name,
            {
              noGlobals: true
            }
          )
        ) {
          return;
        }

        const name = path.scope.generateUidIdentifier("stormExtendableBuiltin");

        const helper = (
          this.opts.approximate ? buildHelperApproximate : buildHelper
        )({
          HELPER: name
        });
        (
          path.scope.getProgramParent().path as NodePath<BabelTypes.Program>
        ).unshiftContainer("body", helper);

        superClass.replaceWith(
          BabelTypes.callExpression(name, [superClass.node])
        );
      }
    }
  };
});
