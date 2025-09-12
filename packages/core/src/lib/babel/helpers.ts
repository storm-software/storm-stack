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

import { ParseResult } from "@babel/parser";
import * as t from "@babel/types";
import { isFunction } from "@stryke/type-checks/is-function";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import {
  BabelPlugin,
  BabelPluginItem,
  BabelPluginTarget
} from "../../types/babel";
import { CompilerOptions } from "../../types/compiler";
import { Context } from "../../types/context";
import { parseAst } from "./ast";

/**
 * Finds an export in the given Babel AST program by its key.
 *
 * @param ast - The parsed Babel AST result containing the program body.
 * @param key - The name of the export to find (e.g., "default" or a named export).
 * @returns The declaration of the export if found, otherwise undefined.
 */
export function findExport(ast: ParseResult<t.File>, key: string) {
  const type =
    key === "default" ? "ExportDefaultDeclaration" : "ExportNamedDeclaration";

  for (const node of ast.program.body) {
    if (node.type === type) {
      if (key === "default") {
        return node.declaration;
      }
      if (node.declaration && "declarations" in node.declaration) {
        const declaration = node.declaration.declarations[0];
        if (
          declaration &&
          "name" in declaration.id &&
          declaration.id.name === key
        ) {
          return declaration.init as any;
        }
      }
    }
  }
}

/**
 * Lists all exports from the given Babel AST program.
 *
 * @param codeOrAst - The parsed Babel AST result containing the program body.
 * @returns An array of export names, including "default" for default exports.
 */
export function listExports(codeOrAst: ParseResult<t.File> | string) {
  const ast = isString(codeOrAst) ? parseAst(codeOrAst) : codeOrAst;

  return ast.program.body
    .flatMap(i => {
      if (i.type === "ExportDefaultDeclaration") {
        return ["default"];
      }
      if (
        i.type === "ExportNamedDeclaration" &&
        i.declaration &&
        "declarations" in i.declaration
      ) {
        return i.declaration.declarations.map(d =>
          "name" in d.id ? d.id.name : ""
        );
      }
      return [];
    })
    .filter(Boolean);
}

/**
 * Get the name of the Babel plugin.
 *
 * @param plugin - The Babel plugin to get the name from.
 * @returns The name of the Babel plugin, or undefined if not found.
 */
export function getPluginName(plugin: BabelPluginItem): string | undefined {
  return isSetString(plugin)
    ? plugin
    : Array.isArray(plugin) && plugin.length > 0
      ? getPluginName(plugin[0])
      : (plugin as BabelPlugin)._name || (plugin as BabelPlugin).name
        ? (plugin as BabelPlugin)._name || (plugin as BabelPlugin).name
        : undefined;
}

/**
 * Check if a Babel plugin is a duplicate of another plugin in the list.
 *
 * @param plugins - The list of existing Babel plugins.
 * @param plugin - The Babel plugin to check for duplicates.
 * @returns True if the plugin is a duplicate, false otherwise.
 */
export function isDuplicatePlugin(
  plugins: BabelPluginItem[],
  plugin: BabelPluginItem
): boolean {
  return !!(
    getPluginName(plugin) &&
    plugins.some(
      existing =>
        Array.isArray(existing) &&
        getPluginName(existing[0]) === getPluginName(plugin)
    )
  );
}

interface SourceFile {
  id: string;
}

export function filterPluginByRuntimeId(context: Context, runtimeId: string) {
  return (sourceFile: SourceFile): boolean =>
    !context.vfs.isMatchingRuntimeId(runtimeId, sourceFile.id);
}

/**
 * Adds a filter to a Babel plugin or a list of Babel plugins.
 *
 * @param context - The context in which the plugin is being added.
 * @param plugins - The Babel plugins to add the filter to.
 * @param filter - The filter function to apply to the plugins.
 * @param name - The name of the plugin to add the filter to.
 * @returns The updated list of Babel plugins with the filter applied.
 */
export function addPluginFilter(
  context: Context,
  plugins: BabelPluginItem[],
  filter: NonNullable<CompilerOptions["filter"]>,
  name: string
): BabelPluginItem[];

/**
 * Adds a filter to a Babel plugin or a list of Babel plugins.
 *
 * @param context - The context in which the plugin is being added.
 * @param plugin - The Babel plugin to add the filter to.
 * @param filter - The filter function to apply to the plugin.
 * @returns The updated Babel plugin with the filter applied.
 */
export function addPluginFilter(
  context: Context,
  plugin: BabelPluginTarget | BabelPluginItem,
  filter: NonNullable<CompilerOptions["filter"]>
): BabelPluginItem;
/**
 * Adds a filter to a Babel plugin or a list of Babel plugins.
 *
 * @param context - The context in which the plugin is being added.
 * @param pluginOrPlugins - The Babel plugin or plugins to add the filter to.
 * @param filter - The filter function to apply to the plugins.
 * @param name - The name of the plugin to add the filter to.
 * @returns The updated list of Babel plugins with the filter applied.
 */
export function addPluginFilter<
  T extends BabelPluginTarget | BabelPluginItem | BabelPluginItem[]
>(
  context: Context,
  pluginOrPlugins: T,
  filter: NonNullable<CompilerOptions["filter"]>,
  name?: string
): T extends BabelPluginItem[] ? BabelPluginItem[] : BabelPluginItem {
  if (
    !Array.isArray(pluginOrPlugins) ||
    (!pluginOrPlugins.some(plugin => Array.isArray(plugin)) &&
      pluginOrPlugins.length < 4 &&
      pluginOrPlugins.length > 0 &&
      (isSetString(pluginOrPlugins[0]) ||
        isFunction(pluginOrPlugins[0]) ||
        (pluginOrPlugins.length > 1 && isObject(pluginOrPlugins[1])) ||
        (pluginOrPlugins.length > 2 && isObject(pluginOrPlugins[2]))))
  ) {
    return Array.isArray(pluginOrPlugins)
      ? [
          pluginOrPlugins[0],
          pluginOrPlugins.length > 1 ? pluginOrPlugins[1] : {},
          {
            filter: sourceFile =>
              filter(sourceFile) &&
              (pluginOrPlugins.length < 2 ||
                !isFunction(pluginOrPlugins[2]?.filter) ||
                // eslint-disable-next-line ts/no-unsafe-call
                pluginOrPlugins[2]?.filter?.(sourceFile))
          }
        ]
      : [
          pluginOrPlugins,
          {},
          {
            filter
          }
        ];
  }

  if (!name) {
    throw new Error(
      "No name was provided to \`addPluginFilter\`, could not find babel plugin without it."
    );
  }

  const foundIndex = pluginOrPlugins.findIndex(
    plugin => getPluginName(plugin)?.toLowerCase() === name.toLowerCase()
  );
  if (foundIndex > -1) {
    pluginOrPlugins[foundIndex] = addPluginFilter(
      context,
      pluginOrPlugins[foundIndex],
      filter,
      name
    );
  }

  return pluginOrPlugins;
}
