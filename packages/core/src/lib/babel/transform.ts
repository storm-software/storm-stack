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
import { isSetString } from "@stryke/type-checks/is-set-string";
import chalk from "chalk";
import { defu } from "defu";
import { BabelPlugin, ResolvedBabelPluginItem } from "../../types/babel";
import { CompilerOptions, SourceFile } from "../../types/compiler";
import { LogFn } from "../../types/config";
import { Context } from "../../types/context";
import { getMagicString, getString } from "../utilities/source-file";
import { getPluginName, isDuplicatePlugin } from "./helpers";

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
  options: CompilerOptions = {}
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
                LogLevelLabel.DEBUG,
                `Skipping filtered Babel plugin ${chalk.bold.cyanBright(
                  getPluginName(plugin) || "unnamed"
                )} for ${sourceFile.id}`
              );
              return ret;
            }

            ret.push([
              isFunction(plugin[0]) ? plugin[0](context) : plugin[0],
              {
                ...(plugin.length > 1 && plugin[1] ? plugin[1] : {}),
                options
              },
              plugin.length > 2 ? plugin[2] : undefined
            ] as ResolvedBabelPluginItem);
          } else {
            ret.push([
              isFunction(plugin) ? plugin(context) : plugin,
              {
                options
              },
              undefined
            ] as ResolvedBabelPluginItem);
          }
        } else {
          log(
            LogLevelLabel.INFO,
            `Skipping duplicate Babel plugin ${getPluginName(plugin)} for ${sourceFile.id}`
          );
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
                LogLevelLabel.INFO,
                `Skipping filtered Babel preset ${getPluginName(preset)} for ${sourceFile.id}`
              );
              return ret;
            }

            ret.push([
              isFunction(preset[0]) ? preset[0](context) : preset[0],
              {
                ...(preset.length > 1 && preset[1] ? preset[1] : {}),
                options
              },
              preset.length > 2 ? preset[2] : undefined
            ] as ResolvedBabelPluginItem);
          } else {
            ret.push([
              isFunction(preset) ? preset(context) : preset,
              {
                options
              },
              undefined
            ] as ResolvedBabelPluginItem);
          }
        } else {
          log(
            LogLevelLabel.INFO,
            `Skipping duplicate Babel preset ${getPluginName(preset)} for ${sourceFile.id}`
          );
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
              return [
                plugin[0],
                defu(plugin.length > 1 && plugin[1] ? plugin[1] : {}, {
                  options
                }),
                (plugin[0] as BabelPlugin)?.name
              ];
            })
          ],
          presets: presets.map(preset => {
            return [
              preset[0],
              defu(preset.length > 1 && preset[1] ? preset[1] : {}, {
                options
              }),
              (preset[0] as BabelPlugin)?.name
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
          ast: false,
          cloneInputAst: false,
          comments: true,
          sourceType: "module",
          configFile: false,
          babelrc: false,
          envName: context.options.mode,
          caller: {
            name: "storm-stack"
          }
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

    return sourceFile;
  } catch (error) {
    context.log(
      LogLevelLabel.ERROR,
      `Error during Babel transformation: ${
        error?.message
          ? isSetString(error.message)
            ? error.message.length > 5000
              ? `${(error.message as string).slice(0, 5000)}... ${(
                  error.message as string
                ).slice(-100)}`
              : error.message
            : error.message
          : "Unknown error"
      }\n${error?.stack ? `\nStack trace:\n${error.stack}\n` : ""}`
    );

    throw new Error(`Babel transformation failed for ${source.id}`);
  }
}
