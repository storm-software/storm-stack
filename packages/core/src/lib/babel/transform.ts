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

import { transformAsync } from "@babel/core";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { isParentPath } from "@stryke/path/is-parent-path";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { defu } from "defu";
import {
  BabelPlugin,
  BabelPluginItem,
  ResolvedBabelPluginItem
} from "../../types/babel";
import { SourceFile, TransformOptions } from "../../types/compiler";
import { LogFn } from "../../types/config";
import { Context } from "../../types/context";
import { serializeContext } from "../context";
import { getMagicString, getString } from "../utilities/source-file";

function getPluginName(plugin: BabelPluginItem): string | undefined {
  return isSetString(plugin)
    ? plugin
    : isSetObject(plugin) && (plugin as BabelPlugin).name
      ? (plugin as BabelPlugin).name
      : Array.isArray(plugin)
        ? getPluginName(plugin[0])
        : undefined;
}

function isDuplicatePlugin(
  plugins: BabelPluginItem[],
  plugin: BabelPluginItem
): boolean {
  return !!(
    getPluginName(plugin) &&
    plugins.some(
      existing => getPluginName(existing[0]) === getPluginName(plugin)
    )
  );
}

/**
 * Transform the code using the Storm Stack Babel plugin.
 *
 * @param log - The logging function to use.
 * @param context - The context of the transformation.
 * @param source - The source file to transform.
 * @param options - The options for the transformation.
 * @returns The transformed source file.
 */
export async function transform(
  log: LogFn,
  context: Context,
  source: SourceFile,
  options: TransformOptions = {}
): Promise<SourceFile> {
  try {
    const corePath = process.env.STORM_STACK_LOCAL
      ? joinPaths(context.options.workspaceRoot, "packages/core")
      : await resolvePackage("@storm-stack/core");
    if (!corePath) {
      throw new Error("Could not resolve @storm-stack/core package location.");
    }

    let sourceFile = source;
    if (
      (process.env.STORM_STACK_LOCAL &&
        isParentPath(sourceFile.id, corePath)) ||
      options.skipAllTransforms ||
      getString(sourceFile.code).includes("/* @storm-ignore */") ||
      getString(sourceFile.code).includes("/* @storm-disable */")
    ) {
      return sourceFile;
    }

    const babelOptions = { ...context.options.babel, ...options.babel };
    if (
      !babelOptions ||
      (!babelOptions.plugins && !babelOptions.presets) ||
      (Array.isArray(babelOptions.plugins) &&
        babelOptions.plugins.length === 0 &&
        Array.isArray(babelOptions.presets) &&
        babelOptions.presets.length === 0)
    ) {
      log(
        LogLevelLabel.WARN,
        `No Babel plugins or presets configured for ${sourceFile.id}. Skipping Babel transformation.`
      );
      return sourceFile;
    }

    const ctx = serializeContext(context);

    const plugins = babelOptions.plugins.reduce<ResolvedBabelPluginItem[]>(
      (ret, plugin) => {
        if (!isDuplicatePlugin(ret, plugin)) {
          if (Array.isArray(plugin) && plugin.length > 0 && plugin[0]) {
            if (
              plugin.length > 2 &&
              plugin[2] &&
              isFunction(plugin[2].filter) &&
              // eslint-disable-next-line ts/no-unsafe-call
              !plugin[2].filter(sourceFile)
            ) {
              log(
                LogLevelLabel.TRACE,
                `Skipping Babel plugin ${getPluginName(plugin)} for ${sourceFile.id}`
              );
              return ret;
            }

            ret.push([
              plugin[0],
              {
                ...(plugin.length > 1 && plugin[1] ? plugin[1] : {}),
                options,
                context: ctx
              },
              plugin.length > 2 ? plugin[2] : undefined
            ] as ResolvedBabelPluginItem);
          } else {
            ret.push([
              plugin,
              {
                options,
                context: ctx
              },
              undefined
            ] as ResolvedBabelPluginItem);
          }
        }

        return ret;
      },
      []
    );
    const presets = babelOptions.presets.reduce<ResolvedBabelPluginItem[]>(
      (ret, preset) => {
        if (!isDuplicatePlugin(ret, preset)) {
          if (Array.isArray(preset) && preset.length > 0 && preset[0]) {
            if (
              preset.length > 2 &&
              preset[2] &&
              isFunction(preset[2].filter) &&
              // eslint-disable-next-line ts/no-unsafe-call
              !preset[2].filter(sourceFile)
            ) {
              log(
                LogLevelLabel.TRACE,
                `Skipping Babel preset ${getPluginName(preset)} for ${sourceFile.id}`
              );
              return ret;
            }

            ret.push([
              preset[0],
              {
                ...(preset.length > 1 && preset[1] ? preset[1] : {}),
                options,
                context: ctx
              },
              preset.length > 2 ? preset[2] : undefined
            ] as ResolvedBabelPluginItem);
          } else {
            ret.push([
              preset,
              {
                options,
                context: ctx
              },
              undefined
            ] as ResolvedBabelPluginItem);
          }
        }

        return ret;
      },
      []
    );

    for (const plugin of plugins.filter(plugin =>
      isFunction(plugin[2]?.onPreTransform)
    )) {
      sourceFile = await Promise.resolve(
        plugin[2]!.onPreTransform!(context, sourceFile)
      );
    }

    for (const preset of presets.filter(preset =>
      isFunction(preset[2]?.onPreTransform)
    )) {
      sourceFile = await Promise.resolve(
        preset[2]!.onPreTransform!(context, sourceFile)
      );
    }

    log(LogLevelLabel.TRACE, `Transforming ${sourceFile.id} with Babel`);

    const result = await transformAsync(
      getString(sourceFile.code),
      defu(
        {
          filename: sourceFile.id,
          plugins: [
            "@babel/plugin-syntax-typescript",
            ...plugins.map(plugin => {
              if (Array.isArray(plugin) && plugin.length > 0) {
                return [
                  plugin[0],
                  defu(plugin.length > 1 && plugin[1] ? plugin[1] : {}, {
                    options,
                    context: ctx
                  })
                ];
              }

              return [
                plugin[0],
                {
                  options,
                  context: ctx
                }
              ];
            })
          ],
          presets: presets.map(preset => {
            if (Array.isArray(preset) && preset.length > 0) {
              return [
                preset[0],
                defu(preset.length > 1 && preset[1] ? preset[1] : {}, {
                  options,
                  context: ctx
                })
              ];
            }

            return [
              preset[0],
              {
                options,
                context: ctx
              }
            ];
          })
        },
        babelOptions
          ? {
              ...babelOptions,
              plugins: [],
              presets: []
            }
          : {},
        {
          highlightCode: true,
          code: true,
          ast: true,
          comments: true,
          sourceType: "module",
          configFile: false,
          babelrc: false,
          envName: context.options.environment
        }
      ) as Parameters<typeof transformAsync>[1]
    );
    if (!result?.code) {
      throw new Error(
        `BabelPluginStormStack failed to compile ${sourceFile.id}`
      );
    }

    log(
      LogLevelLabel.TRACE,
      `Completed Babel transformations of ${sourceFile.id}`
    );

    sourceFile.code = getMagicString(result.code);

    for (const plugin of plugins.filter(plugin =>
      isFunction(plugin[2]?.onPostTransform)
    )) {
      sourceFile = await Promise.resolve(
        plugin[2]!.onPostTransform!(context, sourceFile)
      );
    }

    for (const preset of presets.filter(preset =>
      isFunction(preset[2]?.onPostTransform)
    )) {
      sourceFile = await Promise.resolve(
        preset[2]!.onPostTransform!(context, sourceFile)
      );
    }

    // if (nodes.length > 1) {
    //   for (const node of nodes) {
    //     const result = await context.workers.errorLookup.find({
    //       path: context.options.errorsFile,
    //       message: node.message,
    //       type: node.type
    //     });

    //     node.path.replaceExpressionWithStatements(
    //       toArray(template.ast`
    //       new StormError({ type: "${result.type}", code: ${result.code}${
    //         node.params.length > 0 ? ` params: [${node.params.join(", ")}] ` : ""
    //       } })
    //     `)
    //     );
    //   }
    // }

    return sourceFile;
  } catch (error) {
    context.log(
      LogLevelLabel.ERROR,
      `Error during Babel transformation: ${
        error?.message
          ? isSetString(error.message)
            ? error.message.length > 5000
              ? `${(error.message as string).slice(0, 5000)}...`
              : error.message
            : error.message
          : "Unknown error"
      }\n${error?.stack ? `\nStack trace:\n${error.stack}\n` : ""}`
    );

    throw new Error(`Babel transformation failed for ${source.id}`);
  }
}
