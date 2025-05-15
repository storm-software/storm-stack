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
import {
  findFileExtension,
  findFileName,
  findFolderName
} from "@stryke/path/file-path-fns";
import { isDirectory } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { defu } from "defu";
import type { StormStackCLIPresetConfig } from "../types/config";

export async function initContext<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing CLI specific options for the Storm Stack project.`
  );

  context.options.platform = "node";
  if (context.options.projectType === "application") {
    context.installs["@clack/prompts@0.10.1"] = "dependency";
    context.installs["@stryke/cli"] = "dependency";
  }
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

  let commandsDict = (await listFiles(joinPaths(commandsDir, "*.ts"))).reduce(
    (ret, file) => {
      ret[findFileName(file).replace(findFileExtension(file), "")] =
        file.replace(`${commandsDir}/`, "");
      return ret;
    },
    {} as Record<string, string>
  );

  if (Object.keys(commandsDict).length === 0) {
    commandsDict = (
      await listFiles(joinPaths(commandsDir, "**/index.ts"))
    ).reduce(
      (ret, file) => {
        ret[findFolderName(file)] = file.replace(`${commandsDir}/`, "");
        return ret;
      },
      {} as Record<string, string>
    );
  }

  if (Object.keys(commandsDict).length === 0) {
    log(
      LogLevelLabel.WARN,
      `No commands could be found in ${commandsDir}. Please ensure this is correct.`
    );
  } else {
    log(
      LogLevelLabel.INFO,
      `The following commands were found in the entry directory: \n\n${Object.keys(
        commandsDict
      )
        .map(key => `- ${key}: ${commandsDir}/${commandsDict[key]}`)
        .join("\n")}\n`
    );

    const bin = kebabCase(config.bin || context.options.name || "cli");
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

    await writeFile(
      log,
      joinPaths(context.options.projectRoot, "package.json"),
      StormJSON.stringify(
        defu(
          {
            bin: {
              [bin]: `${joinPaths("dist", bin)}.js`
            }
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
          }
        });
      }

      return ret;
    }, context.entry);
  }
}
