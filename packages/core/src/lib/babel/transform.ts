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
import { resolvePackage } from "@stryke/fs/resolve";
import { isParentPath } from "@stryke/path/is-parent-path";
import { joinPaths } from "@stryke/path/join-paths";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { defu } from "defu";
import { CompilerOptions, SourceFile } from "../../types/compiler";
import { LogFn } from "../../types/config";
import { Context } from "../../types/context";
import { getMagicString, getString } from "../utilities/source-file";
import { getPluginName } from "./helpers";
import {
  applyBabelDefaults,
  resolveBabelInputOptions,
  resolveBabelPlugins,
  resolveBabelPresets
} from "./options";

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

    const resolvedOptions = applyBabelDefaults(
      sourceFile,
      defu(context.options.babel ?? {}, options.babel ?? {})
    );

    const plugins = resolveBabelPlugins(
      log,
      context,
      sourceFile,
      resolvedOptions
    );
    const presets = resolveBabelPresets(
      log,
      context,
      sourceFile,
      resolvedOptions
    );

    if (
      (!plugins && !presets) ||
      (Array.isArray(plugins) &&
        plugins.length === 0 &&
        Array.isArray(presets) &&
        presets.length === 0)
    ) {
      log(
        LogLevelLabel.WARN,
        `No Babel plugins or presets configured for ${sourceFile.id}. Skipping Babel transformation.`
      );
      return sourceFile;
    }

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

    const transformOptions = defu(
      {
        filename: sourceFile.id
      },
      resolveBabelInputOptions(context, resolvedOptions, plugins, presets)
    );

    log(
      LogLevelLabel.DEBUG,
      `Running Babel transforms for ${source.id} with the following configuration: \n${JSON.stringify(
        {
          options: {
            ...transformOptions,
            plugins: "N/A",
            presets: "N/A"
          },
          plugins: transformOptions.plugins?.map(plugin =>
            isSetString(getPluginName(plugin))
              ? getPluginName(plugin)
              : "<unknown>"
          ),
          presets: transformOptions.presets?.map(preset =>
            isSetString(getPluginName(preset))
              ? getPluginName(preset)
              : "<unknown>"
          )
        },
        null,
        2
      )}`
    );

    const result = await transformAsync(
      getString(sourceFile.code),
      transformOptions
    );
    if (!result?.code) {
      throw new Error(
        `BabelPluginStormStack failed to compile ${sourceFile.id}`
      );
    }

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
        (error as Error)?.message
          ? isSetString((error as Error).message)
            ? (error as Error).message.length > 5000
              ? `${(error as Error).message.slice(0, 5000)}... ${(
                  error as Error
                ).message.slice(-100)}`
              : (error as Error).message
            : (error as Error).message
          : "Unknown error"
      }\n${(error as Error)?.stack ? `\nStack trace:\n${(error as Error).stack}\n` : ""}`
    );

    throw new Error(`Babel transformation failed for ${source.id}`);
  }
}
