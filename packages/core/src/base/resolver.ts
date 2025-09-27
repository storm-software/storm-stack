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

import alloyPlugin from "@alloy-js/babel-plugin";
import jsxDomExpressionsPlugin from "@alloy-js/babel-plugin-jsx-dom-expressions";
import {
  TransformOptions as BabelTransformOptions,
  transformSync
} from "@babel/core";
import proposalDecoratorsPlugin from "@babel/plugin-proposal-decorators";
import syntaxClassPropertiesPlugin from "@babel/plugin-syntax-class-properties";
import syntaxImportAssertionsPlugin from "@babel/plugin-syntax-import-assertions";
import syntaxJSXPlugin from "@babel/plugin-syntax-jsx";
import transformExportNamespaceFromPlugin from "@babel/plugin-transform-export-namespace-from";
import typescriptPlugin from "@babel/plugin-transform-typescript";
import { findFileExtension } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { isBoolean } from "@stryke/type-checks/is-boolean";
import parameterDecoratorPlugin from "babel-plugin-parameter-decorator";
import defu from "defu";
import {
  Jiti,
  JitiOptions,
  TransformOptions,
  TransformResult,
  createJiti
} from "jiti";
import importMetaEnvPlugin from "../lib/babel/plugins/import-meta-env";
import importMetaPathsPlugin from "../lib/babel/plugins/import-meta-paths";
import importMetaResolvePlugin from "../lib/babel/plugins/import-meta-resolve";
import transformModulesPlugin from "../lib/babel/plugins/transform-module";
import transformTypeScriptMetaPlugin from "../lib/babel/plugins/transform-typescript-metadata";
import { ResolvedOptions } from "../types/build";
import { Resolver } from "../types/context";

export type CreateResolverOptions = Omit<
  JitiOptions,
  "fsCache" | "moduleCache" | "interopDefault"
> &
  Pick<ResolvedOptions, "mode" | "skipCache"> & {
    workspaceRoot: string;
    projectRoot: string;
    cacheDir: string;
  };

/**
 * Create a Jiti resolver for the given workspace and project root.
 *
 * @param options - The options for creating the resolver.
 * @returns A Jiti instance configured for the specified workspace and project root.
 */
function resolveOptions(options: CreateResolverOptions): JitiOptions {
  return defu(options, {
    interopDefault: true,
    fsCache:
      options.mode !== "development"
        ? joinPaths(options.cacheDir, "jiti")
        : false,
    moduleCache: options.mode !== "development"
  });
}

/**
 * Create a Jiti resolver for the given workspace and project root.
 *
 * @param options - The options for creating the resolver.
 * @returns A Jiti instance configured for the specified workspace and project root.
 */
function createPluginResolver(options: CreateResolverOptions): Jiti {
  return createJiti(
    joinPaths(options.workspaceRoot, options.projectRoot),
    resolveOptions({
      ...options,

      transform: (params: TransformOptions): TransformResult => {
        if (!params.filename) {
          return {
            code: params.source
          };
        }

        const babelOptions = {
          babelrc: false,
          configFile: false,
          compact: false,
          retainLines: isBoolean(params.retainLines)
            ? params.retainLines
            : true,
          filename: params.filename,
          plugins: [
            [
              transformModulesPlugin,
              {
                allowTopLevelThis: true,
                noInterop: !params.interopDefault,
                async: params.async
              }
            ],
            [importMetaPathsPlugin, { filename: params.filename }],
            [importMetaEnvPlugin],
            [importMetaResolvePlugin],
            [syntaxClassPropertiesPlugin],
            [transformExportNamespaceFromPlugin]
          ]
        } as BabelTransformOptions;

        if (
          findFileExtension(params.filename) === "jsx" ||
          findFileExtension(params.filename) === "tsx"
        ) {
          babelOptions.plugins!.push([syntaxJSXPlugin]);
          babelOptions.plugins!.push([
            alloyPlugin,
            {
              alloyModuleName: "@alloy-js/core"
            }
          ]);
          babelOptions.plugins!.push([
            jsxDomExpressionsPlugin,
            {
              alloyModuleName: "@alloy-js/core",
              moduleName: "@alloy-js/core/jsx-runtime",
              generate: "universal",
              wrapConditionals: true,
              preserveWhitespace: true
            }
          ]);
        }

        if (
          findFileExtension(params.filename) === "ts" ||
          findFileExtension(params.filename) === "tsx"
        ) {
          babelOptions.plugins!.push([
            typescriptPlugin,
            {
              allowDeclareFields: true,
              isTSX: findFileExtension(params.filename) === "tsx"
            }
          ]);

          babelOptions.plugins!.unshift([transformTypeScriptMetaPlugin]);
          babelOptions.plugins!.unshift([
            proposalDecoratorsPlugin,
            { legacy: true }
          ]);

          babelOptions.plugins!.push([parameterDecoratorPlugin]);
          babelOptions.plugins!.push([syntaxImportAssertionsPlugin]);
        }

        const result = transformSync(params.source, babelOptions);
        if (!result?.code) {
          return {
            code: params.source,
            error: new Error("Failed to transform source code.")
          };
        }

        return {
          code: result.code
        };
      }
    } as CreateResolverOptions)
  );
}

/**
 * Create a Jiti resolver for the given workspace and project root.
 *
 * @param options - The options for creating the resolver.
 * @returns A Jiti instance configured for the specified workspace and project root.
 */
export function createResolver(options: CreateResolverOptions): Resolver {
  const baseResolver = createJiti(
    joinPaths(options.workspaceRoot, options.projectRoot),
    resolveOptions(options)
  ) as Resolver;
  baseResolver.plugin = createPluginResolver(options);

  return baseResolver;
}
