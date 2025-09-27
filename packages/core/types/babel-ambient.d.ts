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

declare module "@alloy-js/babel-preset" {
  const plugin: () => any;
  export default plugin;
}

declare module "@babel/plugin-syntax-jsx" {
  function jsx(): {
    manipulateOptions: (opts: any, parserOpts: { plugins: string[] }) => void;
  };
  export default jsx;
}

declare module "@babel/plugin-syntax-typescript" {
  function typescript(): {
    manipulateOptions: (opts: any, parserOpts: { plugins: string[] }) => void;
  };
  export default typescript;
}

declare module "@babel/plugin-transform-typescript" {
  interface TransformTypeScriptOptions {
    isTSX?: boolean;
    allExtensions?: boolean;
    allowDeclareFields?: boolean;
    allowNamespaces?: boolean;
    onlyRemoveTypeImports?: boolean;
  }
  function transformTypeScript(options?: TransformTypeScriptOptions): {
    visitor: any;
  };
  export default transformTypeScript;
}

declare module "@babel/plugin-transform-modules-commonjs" {
  interface TransformModulesCommonJSOptions {
    strictMode?: boolean;
    allowTopLevelThis?: boolean;
    noInterop?: boolean;
    lazy?: boolean | ((id: string) => boolean);
    strictNamespace?: boolean;
    importInterop?: "none" | "babel" | "node";
    noAnonymousDefaultExports?: boolean;
  }
  function transformModulesCommonjs(
    options?: TransformModulesCommonJSOptions
  ): { visitor: any };
  export default transformModulesCommonjs;
}

declare module "@babel/plugin-transform-runtime" {
  interface TransformRuntimeOptions {
    absoluteRuntime?: string;
    corejs?: false | 2 | 3 | { version: 2 | 3; proposals: boolean };
    helpers?: boolean;
    regenerator?: boolean;
    useESModules?: boolean;
    version?: string;
    importInterop?: "none" | "babel" | "node";
  }
  function transformRuntime(options?: TransformRuntimeOptions): {
    visitor: any;
  };
  export default transformRuntime;
}

declare module "@babel/helper-simple-access" {
  import type { NodePath } from "@babel/traverse";

  export default function simplifyAccess(
    path: NodePath,
    bindingNames: Set<string>,
    includeUpdateExpression?: boolean
  ): void;
}

declare module "@babel/plugin-transform-modules-amd" {
  interface TransformModulesAmdOptions {
    noInterop?: boolean;
    allowTopLevelThis?: boolean;
    strictMode?: boolean;
    importInterop?: "none" | "babel" | "node";
  }
  function transformModulesAmd(options?: TransformModulesAmdOptions): {
    visitor: any;
  };
  export default transformModulesAmd;
}

declare module "@babel/helper-module-imports" {
  function isModule(path: NodePath): boolean;

  function addNamedImport(
    file: BabelFile,
    source: string,
    name: string,
    imported: string
  ): t.ImportDeclaration;

  function addDefaultImport(
    file: BabelFile,
    source: string,
    imported: string
  ): t.ImportDeclaration;

  function addNamespaceImport(
    file: BabelFile,
    source: string
  ): t.ImportDeclaration;

  export { addDefaultImport, addNamedImport, addNamespaceImport, isModule };
}

declare module "@babel/plugin-syntax-class-properties" {
  function classProperties(): {
    manipulateOptions: (opts: any, parserOpts: { plugins: string[] }) => void;
  };
  export default classProperties;
}

declare module "@babel/plugin-transform-export-namespace-from" {
  function transformExportNamespaceFrom(): { visitor: any };
  export default transformExportNamespaceFrom;
}
