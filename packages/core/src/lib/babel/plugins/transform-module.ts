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

// Based on babel-plugin-transform-modules-commonjs v7.24.7
// MIT - Copyright (c) 2014-present Sebastian McKenzie and other contributors
// https://github.com/babel/babel/tree/c7bb6e0f/packages/babel-plugin-transform-modules-commonjs/src

import type { BabelFile, NodePath, PluginPass, Visitor } from "@babel/core";
import { types as t, template } from "@babel/core";
import { isModule } from "@babel/helper-module-imports";
import type {
  PluginOptions,
  RewriteModuleStatementsAndPrepareHeaderOptions
} from "@babel/helper-module-transforms";
import {
  buildDynamicImport,
  buildNamespaceInitStatements,
  ensureStatementsHoisted,
  getModuleName,
  isSideEffectImport,
  rewriteModuleStatementsAndPrepareHeader,
  wrapInterop
} from "@babel/helper-module-transforms";
import type { PluginAPI } from "@babel/helper-plugin-utils";
import { declare } from "@babel/helper-plugin-utils";
import simplifyAccess from "@babel/helper-simple-access";
import type { Scope } from "@babel/traverse";
import { isBoolean } from "@stryke/type-checks/is-boolean";
import { isFunction } from "@stryke/type-checks/is-function";
import { isString } from "@stryke/type-checks/is-string";

const requireInterop = (
  source: t.Expression,
  file: BabelFile,
  noInterop: boolean | undefined
) => {
  const exp = template.expression.ast`jitiImport(${source})`;
  if (noInterop) {
    return exp;
  }
  return t.callExpression(t.memberExpression(exp, t.identifier("then")), [
    t.arrowFunctionExpression(
      [t.identifier("m")],
      t.callExpression(file.addHelper("interopRequireWildcard"), [
        t.identifier("m")
      ])
    )
  ]);
};

export function transformDynamicImport(
  path: NodePath<t.CallExpression | t.ImportExpression>,
  noInterop: boolean | undefined,
  file: BabelFile
) {
  path.replaceWith(
    buildDynamicImport(path.node, true, false, specifier =>
      requireInterop(specifier, file, noInterop)
    )
  );
}

type Lazy = boolean | string[] | ((source: string) => boolean);

const lazyImportsHook = (lazy: Lazy): CommonJSHook => ({
  name: `babel-plugin-transform-modules-commonjs/lazy`,
  version: "7.24.7",
  getWrapperPayload(source, metadata) {
    if (isSideEffectImport(metadata) || metadata.reexportAll) {
      return null;
    }
    if (lazy === true) {
      // 'true' means that local relative files are eagerly loaded and
      // dependency modules are loaded lazily.
      return source.includes(".") ? null : "lazy/function";
    }
    if (Array.isArray(lazy)) {
      return lazy.includes(source) ? "lazy/function" : null;
    }
    if (typeof lazy === "function") {
      return lazy(source) ? "lazy/function" : null;
    }

    return null;
  },
  buildRequireWrapper(name, init, payload, referenced) {
    if (payload === "lazy/function") {
      if (!referenced) return false;
      return template.statement.ast`
        function ${name}() {
          const data = ${init};
          ${name} = function(){ return data; };
          return data;
        }
      `;
    }

    return null;
  },
  wrapReference(ref, payload) {
    if (payload === "lazy/function") {
      return t.callExpression(ref, []);
    }

    return null;
  }
});
const commonJSHooksKey =
  "@babel/plugin-transform-modules-commonjs/customWrapperPlugin";

type SourceMetadata = Parameters<typeof isSideEffectImport>[0];

// A hook exposes a set of function that can customize how `require()` calls and
// references to the imported bindings are handled. These functions can either
// return a result, or return `null` to delegate to the next hook.
interface CommonJSHook {
  name: string;
  version: string;
  wrapReference?: (
    ref: t.Expression,
    payload: unknown
  ) => t.CallExpression | null | undefined;
  // Optionally wrap a `require` call. If this function returns `false`, the
  // `require` call is removed from the generated code.
  buildRequireWrapper?: (
    name: string,
    init: t.Expression,
    payload: unknown,
    referenced: boolean
  ) => t.Statement | false | null | undefined;
  getWrapperPayload?: (
    source: string,
    metadata: SourceMetadata,
    importNodes: t.Node[]
  ) => string | null | undefined;
}

function defineCommonJSHook(file: BabelFile, hook: CommonJSHook) {
  let hooks = file.get(commonJSHooksKey) as CommonJSHook[] | null;
  if (!hooks) {
    file.set(commonJSHooksKey, (hooks = [] as CommonJSHook[]));
  }

  hooks.push(hook);
}

function findMap<T, U>(
  arr: T[] | null,
  cb: (el: T) => U
): U | undefined | null {
  if (arr) {
    for (const el of arr) {
      const res = cb(el);
      if (res != null) return res;
    }
  }

  return undefined;
}

function makeInvokers(
  file: BabelFile
): Pick<
  CommonJSHook,
  "wrapReference" | "getWrapperPayload" | "buildRequireWrapper"
> {
  const hooks: CommonJSHook[] | null = file.get(commonJSHooksKey);

  return {
    getWrapperPayload(...args) {
      return findMap(hooks, hook => hook.getWrapperPayload?.(...args));
    },
    wrapReference(...args) {
      return findMap(hooks, hook => hook.wrapReference?.(...args));
    },
    buildRequireWrapper(...args) {
      return findMap(hooks, hook => hook.buildRequireWrapper?.(...args));
    }
  };
}

interface Options extends PluginOptions {
  allowCommonJSExports?: boolean;
  allowTopLevelThis?: boolean;
  importInterop?: RewriteModuleStatementsAndPrepareHeaderOptions["importInterop"];
  lazy?: RewriteModuleStatementsAndPrepareHeaderOptions["lazy"];
  loose?: boolean;
  mjsStrictNamespace?: boolean;
  noInterop?: boolean;
  strict?: boolean;
  strictMode?: boolean;
  strictNamespace?: boolean;
  async: boolean;
}

export default declare((api: PluginAPI, options: Options) => {
  // api.assertVersion(REQUIRED_VERSION(7));

  const {
    // 'true' for imports to strictly have .default, instead of having
    // destructuring-like behavior for their properties. This matches the behavior
    // of the initial Node.js (v12) behavior when importing a CommonJS without
    // the __esModule property.
    // .strictNamespace is for non-mjs files, mjsStrictNamespace if for mjs files.
    strictNamespace = false,
    mjsStrictNamespace = strictNamespace,

    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
    importInterop,
    lazy = false,
    // Defaulting to 'true' for now. May change before 7.x major.
    allowCommonJSExports = true,
    loose = false,
    async = false
  } = options;

  const constantReexports = api.assumption("constantReexports") ?? loose;
  const enumerableModuleMeta = api.assumption("enumerableModuleMeta") ?? loose;
  const noIncompleteNsImportDetection =
    api.assumption("noIncompleteNsImportDetection") ?? false;

  if (
    !isBoolean(lazy) &&
    !isFunction(lazy) &&
    (!Array.isArray(lazy) || !lazy.every(item => isString(item)))
  ) {
    throw new Error(`.lazy must be a boolean, array of strings, or a function`);
  }

  if (typeof strictNamespace !== "boolean") {
    throw new TypeError(`.strictNamespace must be a boolean, or undefined`);
  }
  if (typeof mjsStrictNamespace !== "boolean") {
    throw new TypeError(`.mjsStrictNamespace must be a boolean, or undefined`);
  }

  const getAssertion = (localName: string) => template.expression.ast`
    (function(){
      throw new Error(
        "The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules." +
        "Consider setting setting sourceType:script or sourceType:unambiguous in your " +
        "Babel config for this file.");
    })()
  `;

  const moduleExportsVisitor: Visitor<{ scope: Scope }> = {
    ReferencedIdentifier(path) {
      const localName = path.node.name;
      if (localName !== "module" && localName !== "exports") return;

      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);

      if (
        // redeclared in this scope
        rootBinding !== localBinding ||
        (path.parentPath.isObjectProperty({ value: path.node }) &&
          path.parentPath.parentPath.isObjectPattern()) ||
        path.parentPath.isAssignmentExpression({ left: path.node }) ||
        path.isAssignmentExpression({ left: path.node })
      ) {
        return;
      }

      path.replaceWith(getAssertion(localName));
    },

    UpdateExpression(path) {
      const arg = path.get("argument");
      if (!arg.isIdentifier()) return;
      const localName = arg.node.name;
      if (localName !== "module" && localName !== "exports") return;

      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);

      // redeclared in this scope
      if (rootBinding !== localBinding) return;

      path.replaceWith(
        t.assignmentExpression(
          `${path.node.operator[0]}=`,
          arg.node,
          getAssertion(localName)
        )
      );
    },

    AssignmentExpression(path) {
      const left = path.get("left");
      if (left.isIdentifier()) {
        const localName = left.node.name;
        if (localName !== "module" && localName !== "exports") return;

        const localBinding = path.scope.getBinding(localName);
        const rootBinding = this.scope.getBinding(localName);

        // redeclared in this scope
        if (rootBinding !== localBinding) return;

        const right = path.get("right");
        right.replaceWith(
          t.sequenceExpression([right.node, getAssertion(localName)])
        );
      } else if (left.isPattern()) {
        const ids = left.getOuterBindingIdentifiers();
        const localName = Object.keys(ids).find(localName => {
          if (localName !== "module" && localName !== "exports") return false;

          return (
            this.scope.getBinding(localName) ===
            path.scope.getBinding(localName)
          );
        });

        if (localName) {
          const right = path.get("right");
          right.replaceWith(
            t.sequenceExpression([right.node, getAssertion(localName)])
          );
        }
      }
    }
  };

  return {
    name: "transform-modules-commonjs",

    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "commonjs");

      if (lazy) defineCommonJSHook(this.file, lazyImportsHook(lazy));
    },

    visitor: {
      [`CallExpression${
        // @ts-expect-error
        api.types.importExpression ? "|ImportExpression" : ""
      }`](
        this: PluginPass,
        path: NodePath<t.CallExpression | t.ImportExpression>
      ) {
        if (path.isCallExpression() && !t.isImport(path.node.callee)) return;

        let { scope } = path;
        do {
          scope.rename("require");
        } while ((scope = scope.parent));

        transformDynamicImport(path, noInterop, this.file);
      },

      Program: {
        exit(path, state) {
          if (!isModule(path)) return;

          // Rename the bindings auto-injected into the scope so there is no
          // risk of conflict between the bindings.
          path.scope.rename("exports");
          path.scope.rename("module");
          path.scope.rename("require");
          path.scope.rename("__filename");
          path.scope.rename("__dirname");

          // Rewrite references to 'module' and 'exports' to throw exceptions.
          // These objects are specific to CommonJS and are not available in
          // real ES6 implementations.
          if (!allowCommonJSExports) {
            if (process.env.BABEL_8_BREAKING) {
              simplifyAccess(path, new Set(["module", "exports"]));
            } else {
              simplifyAccess(path, new Set(["module", "exports"]), false);
            }
            path.traverse(moduleExportsVisitor, {
              scope: path.scope
            });
          }

          let moduleName = getModuleName(this.file.opts, options);
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          const hooks = makeInvokers(this.file);

          const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(
            path,
            {
              exportName: "exports",
              constantReexports,
              enumerableModuleMeta,
              strict,
              strictMode,
              allowTopLevelThis,
              noInterop,
              importInterop,
              wrapReference: hooks.wrapReference,
              getWrapperPayload: hooks.getWrapperPayload,
              esNamespaceOnly:
                typeof state.filename === "string" &&
                /\.mjs$/.test(state.filename)
                  ? mjsStrictNamespace
                  : strictNamespace,
              noIncompleteNsImportDetection,
              filename: this.file.opts.filename
            }
          );

          for (const [source, metadata] of meta.source) {
            const loadExpr = async
              ? t.awaitExpression(
                  t.callExpression(t.identifier("jitiImport"), [
                    t.stringLiteral(source)
                  ])
                )
              : t.callExpression(t.identifier("require"), [
                  t.stringLiteral(source)
                ]);

            let header: t.Statement | undefined | null;
            if (isSideEffectImport(metadata)) {
              if (lazy && metadata.wrap === "function") {
                throw new Error("Assertion failure");
              }

              header = t.expressionStatement(loadExpr);
            } else {
              const init =
                wrapInterop(path, loadExpr, metadata.interop) || loadExpr;

              if (metadata.wrap) {
                const res = hooks.buildRequireWrapper!(
                  metadata.name,
                  init,
                  metadata.wrap,
                  metadata.referenced
                );
                if (res === false) continue;
                else {
                  header = res;
                }
              }
              header ??= template.statement.ast`
                var ${metadata.name} = ${init};
              `;
            }
            header.loc = metadata.loc;
            headers.push(
              header,
              ...buildNamespaceInitStatements(
                meta,
                metadata,
                constantReexports,
                hooks.wrapReference
              )
            );
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);

          path.get("body").forEach(path => {
            if (!headers.includes(path.node)) return;
            if (path.isVariableDeclaration()) {
              path.scope.registerDeclaration(path);
            }
          });
        }
      }
    }
  };
});
