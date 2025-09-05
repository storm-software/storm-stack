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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { isFunction } from "@stryke/type-checks/is-function";
import chalk from "chalk";
import defu from "defu";
import {
  BabelInputOptions,
  BabelPlugin,
  ResolvedBabelPluginItem
} from "../../types/babel";
import { ResolvedBabelOptions } from "../../types/build";
import { SourceFile } from "../../types/compiler";
import { LogFn } from "../../types/config";
import { Context } from "../../types/context";
import { getPluginName, isDuplicatePlugin } from "./helpers";

/**
 * Resolves the plugins for [Babel](https://babeljs.io/).
 *
 * @param log - The logging function to use.
 * @param context - The context of the transformation.
 * @param sourceFile - The source file to transform.
 * @param options - The options for the transformation.
 * @returns The resolved Babel plugins.
 */
export function resolveBabelPlugins(
  log: LogFn,
  context: Context,
  sourceFile?: SourceFile,
  options: Partial<ResolvedBabelOptions> = {}
): ResolvedBabelPluginItem[] {
  return !options.plugins
    ? []
    : options.plugins.reduce<ResolvedBabelPluginItem[]>((ret, plugin) => {
        if (!isDuplicatePlugin(ret, plugin)) {
          if (Array.isArray(plugin) && plugin.length > 0 && plugin[0]) {
            if (
              sourceFile &&
              plugin.length > 2 &&
              plugin[2] &&
              isFunction(plugin[2].filter) &&
              // eslint-disable-next-line ts/no-unsafe-call
              !plugin[2].filter(sourceFile)
            ) {
              log(
                LogLevelLabel.TRACE,
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
            `Skipping duplicate Babel plugin ${getPluginName(plugin)}${
              sourceFile?.id ? ` for ${sourceFile.id}` : ""
            }`
          );
        }

        return ret;
      }, []);
}

/**
 * Resolves the presets for [Babel](https://babeljs.io/).
 *
 * @param log - The logging function to use.
 * @param context - The context of the transformation.
 * @param sourceFile - The source file to transform.
 * @param options - The options for the transformation.
 * @returns The resolved Babel presets.
 */
export function resolveBabelPresets(
  log: LogFn,
  context: Context,
  sourceFile?: SourceFile,
  options: Partial<ResolvedBabelOptions> = {}
): ResolvedBabelPluginItem[] {
  return !options.presets
    ? []
    : options.presets.reduce<ResolvedBabelPluginItem[]>((ret, preset) => {
        if (!isDuplicatePlugin(ret, preset)) {
          if (Array.isArray(preset) && preset.length > 0 && preset[0]) {
            if (
              sourceFile &&
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
            `Skipping duplicate Babel preset ${getPluginName(preset)}${
              sourceFile?.id ? ` for ${sourceFile.id}` : ""
            }`
          );
        }

        return ret;
      }, []);
}

/**
 * Resolves the options for [Babel](https://babeljs.io/).
 *
 * @param context - The context for the transformation.
 * @param options - The options for the transformation.
 * @param plugins - The Babel plugins to use.
 * @param presets - The Babel presets to use.
 * @returns The resolved Babel options.
 */
export function resolveBabelInputOptions(
  context: Context,
  options: Partial<ResolvedBabelOptions> = {},
  plugins: ResolvedBabelPluginItem[] = [],
  presets: ResolvedBabelPluginItem[] = []
): BabelInputOptions {
  return defu(
    {
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
    options
      ? {
          ...options,
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
  ) as ResolvedBabelOptions;
}

/**
 * Resolves the options for [Babel](https://babeljs.io/).
 *
 * @param context - The context for the transformation.
 * @param log - The logging function to use.
 * @param options - The options for the transformation.
 * @returns The resolved Babel options.
 */
export function resolveBabelOptions(
  context: Context,
  log: LogFn = context.log,
  options: Partial<ResolvedBabelOptions> = {}
): BabelInputOptions {
  return resolveBabelInputOptions(
    context,
    options,
    resolveBabelPlugins(log, context, undefined, options),
    resolveBabelPresets(log, context, undefined, options)
  );
}
