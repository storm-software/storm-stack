/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { LogFn } from "@storm-stack/core/types";
import type { Context, Options } from "@storm-stack/core/types/build";
import { listFiles } from "@stryke/fs/list-files";
import { readJsonFile } from "@stryke/fs/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import { findFileExtension, findFileName } from "@stryke/path/file-path-fns";
import { isDirectory } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { constantCase } from "@stryke/string-format/constant-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { defu } from "defu";
import type { StormStackCLIPresetConfig } from "../types/config";

export async function initContext<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  context.options.platform = "node";

  context.override.alias ??= {};
  context.override.alias["storm:cli"] = joinPaths(
    context.options.projectRoot,
    context.artifactsDir,
    "runtime",
    "cli.ts"
  );

  context.override.noExternal ??= [];
  if (Array.isArray(context.override.noExternal)) {
    context.override.noExternal.push("storm:cli");
  }

  context.options.dotenv ??= {};
  context.options.dotenv.prefix = (
    !context.options.dotenv.prefix
      ? []
      : Array.isArray(context.options.dotenv.prefix)
        ? context.options.dotenv.prefix
        : [context.options.dotenv.prefix]
  ).reduce(
    (ret, prefix) => {
      const prefixName = constantCase(prefix.replace(/_$/, ""));
      if (prefixName && !ret.includes(prefixName)) {
        ret.push(prefixName);
      }

      return ret;
    },
    (!config.bin
      ? []
      : typeof config.bin === "string"
        ? [config.bin]
        : config.bin
    ).map(bin => constantCase(bin))
  );
}

export async function initInstalls<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  if (
    context.options.projectType === "application" &&
    config.interactive !== "never"
  ) {
    context.installs["@clack/prompts@0.10.1"] = "dependency";
  }
}

export async function initUnimport<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  const imports = [
    "parseArgs",
    "colors",
    "getColor",
    "ColorName",
    "link",
    "LinkOptions"
  ];
  if (config.interactive !== "never") {
    imports.push(
      "prompt",
      "PromptCommonOptions",
      "TextPromptOptions",
      "ConfirmPromptOptions",
      "SelectPromptOptions",
      "MultiSelectPromptOptions"
    );
  }

  context.unimportPresets ??= [];
  context.unimportPresets.push({
    imports,
    from: joinPaths(
      context.options.projectRoot,
      context.artifactsDir,
      "runtime",
      "cli"
    )
  });
}

export async function initEntry<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  if (!isSetString(context.options.entry)) {
    throw new Error(
      `The entry point must be a string pointing to a directory containing the CLI application's commands. Please check your \`entry\` configuration - ${context.options.entry ? `provided: ${isString(context.options.entry) ? context.options.entry : StormJSON.stringify(context.options.entry)}` : "no entry point was provided"}.`
    );
  }

  const commandsDir = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.entry
  );
  if (!isDirectory(commandsDir)) {
    throw new Error(
      `The entry point must be a string pointing to a directory containing the CLI application's commands. Please check your \`entry\` configuration - provided: ${context.options.entry}.`
    );
  }

  let commandsDict = (await listFiles(joinPaths(commandsDir, "**/*.ts")))
    .filter(file => findFileName(file) !== "index.ts")
    .reduce(
      (ret, file) => {
        const filePath = file.replace(commandsDir, "").replaceAll(/^\/+/g, "");
        ret[
          filePath.replace(findFileExtension(filePath), "").replaceAll("/", "-")
        ] = filePath;
        return ret;
      },
      {} as Record<string, string>
    );

  commandsDict = (
    await listFiles(joinPaths(commandsDir, "**/index.ts"))
  ).reduce((ret, file) => {
    const filePath = file.replace(commandsDir, "").replaceAll(/^\/+/g, "");
    ret[
      filePath
        .replace(findFileName(filePath), "")
        .replaceAll(/\/+$/g, "")
        .replaceAll("/", "-")
    ] = filePath;
    return ret;
  }, commandsDict);

  if (Object.keys(commandsDict).length === 0) {
    log(
      LogLevelLabel.WARN,
      `No commands could be found in ${commandsDir}. Please ensure this is correct.`
    );
  } else {
    log(
      LogLevelLabel.INFO,
      `The following commands were found in the entry directory: \n${Object.keys(
        commandsDict
      )
        .map(key => ` - ${key}: ${commandsDir}/${commandsDict[key]}`)
        .join("\n")}`
    );

    const bin =
      kebabCase(
        config.bin &&
          (isSetString(config.bin) ||
            (Array.isArray(config.bin) &&
              config.bin.length > 0 &&
              config.bin[0]))
          ? isSetString(config.bin)
            ? config.bin
            : config.bin[0]
          : context.options.name || context.packageJson?.name
      ) || "cli";
    context.entry = [
      {
        file: joinPaths(
          context.options.projectRoot,
          context.artifactsDir,
          `${bin}.ts`
        ),
        input: {
          file: context.options.entry
        },
        output: bin
      }
    ];

    let packageJson = context.packageJson;
    if (!packageJson) {
      packageJson = await readJsonFile(
        joinPaths(context.options.projectRoot, "package.json")
      );
    }

    let binConfig = {};
    if (config.bin && Array.isArray(config.bin) && config.bin.length > 0) {
      binConfig = config.bin.reduce(
        (ret, binName) => {
          ret[kebabCase(binName)] = `${joinPaths("dist", bin)}.mjs`;
          return ret;
        },
        binConfig as Record<string, string>
      );
    } else {
      binConfig[kebabCase(bin)] = `${joinPaths("dist", bin)}.mjs`;
    }

    await writeFile(
      log,
      joinPaths(context.options.projectRoot, "package.json"),
      StormJSON.stringify(
        defu(
          {
            bin: binConfig
          },
          packageJson
        )
      )
    );

    context.entry = Object.keys(commandsDict).reduce((ret, command) => {
      if (!commandsDict[command]) {
        log(
          LogLevelLabel.WARN,
          `No command file found for ${command}. Please ensure this is correct.`
        );
        return ret;
      }

      const entryFile = joinPaths(
        context.options.projectRoot,
        context.artifactsDir,
        "commands",
        commandsDict[command]
      );
      if (ret.some(entry => entry.file === entryFile)) {
        log(
          LogLevelLabel.WARN,
          `Duplicate entry file found: ${entryFile}. Please ensure this is correct.`
        );
      } else {
        ret.push({
          file: entryFile,
          input: {
            file: joinPaths(
              context.options.entry as string,
              commandsDict[command]
            )
          },
          output: command
        });
      }

      return ret;
    }, context.entry);
  }
}
