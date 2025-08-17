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
import * as t from "@babel/types";
import { BabelPluginOptions } from "../../../types/babel";
import { Context } from "../../../types/context";
import { isImportCall } from "../module";

type ModuleResolverPluginPass = PluginPass<BabelPluginOptions> & {
  context: Context;
  moduleResolverVisited: Set<any>;
  api: PluginAPI;
};

function resolveModulePath(
  nodePath: NodePath<t.StringLiteral>,
  state: ModuleResolverPluginPass
) {
  if (!t.isStringLiteral(nodePath.node)) {
    return;
  }

  const sourcePath = nodePath.node.value;
  // const currentFile = state.file.opts.filename;

  const resolvedPath = state.context?.vfs.resolvePath(sourcePath);
  if (resolvedPath) {
    nodePath.replaceWith(
      t.stringLiteral(
        // Remove the file extension if it exists
        resolvedPath.replace(/\.(?:ts|mts|cts)x?$/, "")
      )
    );
  }
}

const TRANSFORM_FUNCTIONS = [
  "require",
  "require.resolve",
  "System.import",

  // Jest methods
  "jest.genMockFromModule",
  "jest.mock",
  "jest.unmock",
  "jest.doMock",
  // eslint-disable-next-line @cspell/spellchecker
  "jest.dontMock",
  "jest.setMock",
  "jest.requireActual",
  "jest.requireMock",

  // Older Jest methods
  "require.requireActual",
  "require.requireMock"
];

function matchesPattern(
  state: ModuleResolverPluginPass,
  calleePath: NodePath,
  pattern: string
) {
  const { node } = calleePath;

  if (t.isMemberExpression(node)) {
    return calleePath.matchesPattern(pattern);
  }

  if (!t.isIdentifier(node) || pattern.includes(".")) {
    return false;
  }

  const name = pattern.split(".")[0];

  return node.name === name;
}

const importVisitors = {
  CallExpression: (
    nodePath: NodePath<t.CallExpression>,
    state: ModuleResolverPluginPass
  ) => {
    if (state.moduleResolverVisited.has(nodePath)) {
      return;
    }

    const calleePath = nodePath.get("callee");

    if (
      TRANSFORM_FUNCTIONS.some(pattern =>
        matchesPattern(state, calleePath, pattern)
      ) ||
      isImportCall(nodePath)
    ) {
      state.moduleResolverVisited.add(nodePath);
      resolveModulePath(
        nodePath.get("arguments.0") as NodePath<t.StringLiteral>,
        state
      );
    }
  },
  // eslint-disable-next-line ts/naming-convention
  "ImportDeclaration|ExportDeclaration|ExportAllDeclaration": (
    nodePath: NodePath<
      t.ImportDeclaration | t.ExportDeclaration | t.ExportAllDeclaration
    >,
    state: ModuleResolverPluginPass
  ) => {
    if (state.moduleResolverVisited.has(nodePath)) {
      return;
    }

    state.moduleResolverVisited.add(nodePath);
    resolveModulePath(nodePath.get("source"), state);
  }
};

export function ModuleResolverPlugin(context: Context) {
  return declare(function builder(api: PluginAPI) {
    let moduleResolverVisited = new Set();

    return {
      name: "storm-stack:module-resolver",
      manipulateOptions(opts) {
        opts.filename ??= "unknown";
      },

      pre() {
        // We need to keep track of all handled nodes so we do not try to transform them twice,
        // because we run before (enter) and after (exit) all nodes are handled
        moduleResolverVisited = new Set();
      },

      visitor: {
        Program: {
          enter(
            programPath: NodePath<t.Program>,
            state: PluginPass<BabelPluginOptions>
          ) {
            programPath.traverse(importVisitors, {
              ...state,
              context,
              moduleResolverVisited,
              api
            } as ModuleResolverPluginPass);
          },
          exit(programPath, state) {
            programPath.traverse(importVisitors, {
              ...state,
              context,
              moduleResolverVisited,
              api
            } as ModuleResolverPluginPass);
          }
        }
      },

      post() {
        moduleResolverVisited.clear();
      }
    };
  });
}
