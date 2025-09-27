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

import type { ConfigAPI, NodePath, types as t } from "@babel/core";
import type { HubInterface } from "@babel/traverse";

declare module "@babel/helper-plugin-utils" {
  const knownAssumptions: readonly [
    "arrayLikeIsIterable",
    "constantReexports",
    "constantSuper",
    "enumerableModuleMeta",
    "ignoreFunctionLength",
    "ignoreToPrimitiveHint",
    "iterableIsArray",
    "mutableTemplateObject",
    "noClassCalls",
    "noDocumentAll",
    "noIncompleteNsImportDetection",
    "noNewArrows",
    "noUninitializedPrivateFieldAccess",
    "objectRestNoSymbols",
    "privateFieldsAsSymbols",
    "privateFieldsAsProperties",
    "pureGetters",
    "setClassMethods",
    "setComputedProperties",
    "setPublicClassFields",
    "setSpreadProperties",
    "skipForOfIteratorClosing",
    "superIsCallableConstructor"
  ];

  export type AssumptionName = (typeof knownAssumptions)[number];

  type AssumptionFunction = (name: AssumptionName) => boolean | undefined;

  export type Target =
    | "node"
    | "deno"
    | "chrome"
    | "opera"
    | "edge"
    | "firefox"
    | "safari"
    | "ie"
    | "ios"
    | "android"
    | "electron"
    | "samsung"
    | "opera_mobile";

  export type Targets = {
    [target in Target]?: string;
  };

  type TargetsFunction = () => Targets;

  export type PresetAPI = {
    targets: TargetsFunction;
    addExternalDependency: (ref: string) => void;
  } & ConfigAPI;

  export type PluginAPI = {
    assumption: AssumptionFunction;
  } & PresetAPI &
    BabelAPI;
}

declare module "@babel/core" {
  export interface BabelFile
    extends HubInterface,
      Pick<PluginPass, "get" | "set"> {}
}

declare module "@babel/helper-module-transforms" {
  interface LocalExportMetadata {
    /**
     * names of exports
     */
    names: string[];
    kind: "import" | "hoisted" | "block" | "var";
  }

  type InteropType =
    /**
     * Babel interop for default-only imports
     */
    | "default"
    /**
     * Babel interop for namespace or default+named imports
     */
    | "namespace"
    /**
     * Node.js interop for default-only imports
     */
    | "node-default"
    /**
     * Node.js interop for namespace or default+named imports
     */
    | "node-namespace"
    /**
     * No interop, or named-only imports
     */
    | "none";

  interface SourceModuleMetadata {
    /**
     * A unique variable name to use for this namespace object.
     * Centralized for simplicity.
     */
    name: string;
    loc: t.SourceLocation | undefined | null;
    interop: InteropType;
    /**
     * Local binding to reference from this source namespace.
     * Key: Local name, value: Import name
     */
    imports: Map<string, string>;
    /**
     * Local names that reference namespace object.
     */
    importsNamespace: Set<string>;
    /**
     * Reexports to create for namespace. Key: Export name, value: Import name
     */
    reexports: Map<string, string>;
    /**
     * List of names to re-export namespace as.
     */
    reexportNamespace: Set<string>;
    /**
     * Tracks if the source should be re-exported.
     */
    reexportAll: null | {
      loc: t.SourceLocation | undefined | null;
    };
    wrap?: unknown;
    referenced: boolean;
  }

  interface ModuleMetadata {
    exportName: string;
    /**
     * The name of the variable that will reference an object
     * containing export names.
     */
    exportNameListName: null | string;
    hasExports: boolean;
    /**
     * Lookup from local binding to export information.
     */
    local: Map<string, LocalExportMetadata>;
    /**
     * Lookup of source file to source file metadata.
     */
    source: Map<string, SourceModuleMetadata>;
    /**
     * List of names that should only be printed as string literals.
     * i.e. `import { "any unicode" as foo } from "some-module"`
     * `stringSpecifiers` is `Set(1) ["any unicode"]`
     * In most cases `stringSpecifiers` is an empty Set
     */
    stringSpecifiers: Set<string>;
  }

  type ImportInterop =
    | "none"
    | "babel"
    | "node"
    | ((source: string, filename?: string) => "none" | "babel" | "node");

  type Lazy = boolean | string[] | ((source: string) => boolean);

  interface RootOptions {
    filename?: string | null;
    filenameRelative?: string | null;
    sourceRoot?: string | null;
  }

  export interface PluginOptions {
    moduleId?: string;
    moduleIds?: boolean;
    getModuleId?: (moduleName: string) => string | null | undefined;
    moduleRoot?: string;
  }

  export function getModuleName(
    rootOpts: RootOptions,
    pluginOpts: PluginOptions
  ): string | null;

  export interface RewriteModuleStatementsAndPrepareHeaderOptions {
    exportName?: string;
    strict?: boolean;
    allowTopLevelThis?: boolean;
    strictMode?: boolean;
    loose?: boolean;
    importInterop?: ImportInterop;
    noInterop?: boolean;
    lazy?: Lazy;
    getWrapperPayload?: (
      source: string,
      metadata: SourceModuleMetadata,
      importNodes: t.Node[]
    ) => unknown;
    wrapReference?: (
      ref: t.Expression,
      payload: unknown
    ) => t.Expression | null | undefined;
    esNamespaceOnly?: boolean;
    filename: string | undefined | null;
    constantReexports?: boolean | void;
    enumerableModuleMeta?: boolean | void;
    noIncompleteNsImportDetection?: boolean | void;
  }

  /**
   * Perform all of the generic ES6 module rewriting needed to handle initial
   * module processing. This function will rewrite the majority of the given
   * program to reference the modules described by the returned metadata,
   * and returns a list of statements for use when initializing the module.
   */
  export function rewriteModuleStatementsAndPrepareHeader(
    path: NodePath<t.Program>,
    options: RewriteModuleStatementsAndPrepareHeaderOptions
  ): {
    meta: ModuleMetadata;
    headers: t.Statement[];
  };

  /**
   * Check if a given source is an anonymous import, e.g. `import 'foo';`
   */
  export function isSideEffectImport(source: SourceModuleMetadata): boolean;

  /**
   * Create the runtime initialization statements for a given requested source.
   * These will initialize all of the runtime import/export logic that
   * can't be handled statically by the statements created by
   * `buildExportInitializationStatements()`.
   */
  export function buildNamespaceInitStatements(
    metadata: ModuleMetadata,
    sourceMetadata: SourceModuleMetadata,
    constantReexports?: boolean | void,
    wrapReference?: (
      ref: t.Identifier,
      payload: unknown
    ) => t.Expression | null | undefined
  ): t.Statement[];

  /**
   * Flag a set of statements as hoisted above all else so that module init
   * statements all run before user code.
   */
  export function ensureStatementsHoisted(statements: t.Statement[]): void;

  /**
   * Given an expression for a standard import object, like `require('foo')`,
   * wrap it in a call to the interop helpers based on the type.
   */
  export function wrapInterop(
    programPath: NodePath<t.Program>,
    expr: t.Expression,
    type: InteropType
  ): t.CallExpression;

  export function buildDynamicImport(
    node: t.CallExpression | t.ImportExpression,
    deferToThen: boolean,
    wrapWithPromise: boolean,
    builder: (specifier: t.Expression) => t.Expression
  ): t.Expression;
}

export {};
