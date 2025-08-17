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
import { isMatchFound } from "@storm-stack/core/lib/typescript/tsconfig";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import type { LogFn } from "@storm-stack/core/types/config";
import { toArray } from "@stryke/convert/to-array";
import { readJsonFile } from "@stryke/fs/json";
import { listFiles } from "@stryke/fs/list-files";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  findFolderName
} from "@stryke/path/file-path-fns";
import { resolveParentPath } from "@stryke/path/get-parent-path";
import { isDirectory } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { constantCase } from "@stryke/string-format/constant-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { TsConfigJson } from "@stryke/types/tsconfig";
import { defu } from "defu";
import type {
  CLIPluginContext,
  CLIPluginContextOptions,
  CLIPluginOptions
} from "../types/config";
import {
  getCommandReflectionsPath,
  readAllCommandsReflection
} from "./persistence";

export async function initOptions(
  context: CLIPluginContext,
  options: CLIPluginOptions
) {
  context.options.platform = "node";
  context.options.environment = "cli";
  context.options.skipNodeModulesBundle = true;

  context.options.esbuild.override ??= {};
  context.options.esbuild.target ??= "esnext";
  context.options.esbuild.format ??= "esm";

  context.options.plugins.cli ??= {} as CLIPluginContextOptions["cli"];

  context.options.plugins.cli.bin ??= options.bin
    ? toArray(options.bin)
    : [context.options.name];
  context.options.plugins.cli.minNodeVersion ??= options.minNodeVersion ?? 20;
  context.options.plugins.cli.interactive ??= options.interactive ?? true;
  context.options.plugins.cli.title ??= options.title!;
  context.options.plugins.cli.author ??= options.author;

  context.options.plugins.config.prefix = toArray(options.bin)
    .reduce(
      (ret, bin) => {
        const prefix = constantCase(bin);
        if (!ret.includes(prefix)) {
          ret.push(prefix);
        }
        return ret;
      },
      toArray(context.options.plugins.config.prefix ?? [])
    )
    .filter(Boolean);
}

export async function initInstalls(context: CLIPluginContext) {
  if (
    context.options.projectType === "application" &&
    context.options.plugins.cli.interactive !== "never"
  ) {
    context.packageDeps["@clack/prompts@0.10.1"] = "dependency";
  }
}

export async function initTsconfig(context: CLIPluginContext) {
  const tsconfigJson = await readJsonFile<TsConfigJson>(
    context.tsconfig.tsconfigFilePath
  );

  tsconfigJson.compilerOptions ??= {};
  tsconfigJson.compilerOptions.types ??= [];

  if (context.tsconfig.options.sourceMap !== true) {
    tsconfigJson.compilerOptions.sourceMap = true;
  }

  if (context.tsconfig.options.resolveJsonModule !== true) {
    tsconfigJson.compilerOptions.resolveJsonModule = true;
  }

  if (context.tsconfig.options.allowJs !== true) {
    tsconfigJson.compilerOptions.allowJs = true;
  }

  if (
    !tsconfigJson.compilerOptions.types ||
    !isMatchFound("node", tsconfigJson.compilerOptions.types)
  ) {
    tsconfigJson.compilerOptions.types ??= [];
    tsconfigJson.compilerOptions.types.push("node");
  }

  return writeFile(
    context.log,
    context.tsconfig.tsconfigFilePath,
    StormJSON.stringify(tsconfigJson)
  );
}

export async function initEntry(log: LogFn, context: CLIPluginContext) {
  if (!isSetString(context.options.entry)) {
    throw new Error(
      `The entry point must be a string pointing to a directory containing the CLI application's commands. Please check your \`entry\` configuration - ${
        context.options.entry
          ? `provided: ${
              isString(context.options.entry)
                ? context.options.entry
                : StormJSON.stringify(context.options.entry)
            }`
          : "no entry point was provided"
      }.`
    );
  }

  const commandsDir = joinPaths(
    context.options.workspaceRoot,
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
          filePath
            .replace(findFileExtension(filePath) || "", "")
            .replaceAll("/", "-")
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
        context.options.plugins.cli.bin &&
          (isSetString(context.options.plugins.cli.bin) ||
            (Array.isArray(context.options.plugins.cli.bin) &&
              context.options.plugins.cli.bin.length > 0 &&
              context.options.plugins.cli.bin[0]))
          ? isSetString(context.options.plugins.cli.bin)
            ? context.options.plugins.cli.bin
            : context.options.plugins.cli.bin[0]
          : context.options.name || context.packageJson?.name
      ) || "cli";
    context.entry = [
      {
        file: joinPaths(context.artifactsPath, `${bin}.ts`),
        input: {
          file: context.options.entry
        },
        path: [],
        isVirtual: false,
        output: bin
      }
    ];

    log(
      LogLevelLabel.TRACE,
      "Writing the command bin configuration to the package.json file."
    );

    let packageJson = context.packageJson;
    if (!packageJson) {
      packageJson = await readJsonFile(
        joinPaths(
          context.options.workspaceRoot,
          context.options.projectRoot,
          "package.json"
        )
      );
    }

    let binConfig = {};
    if (
      context.options.plugins.cli.bin &&
      Array.isArray(context.options.plugins.cli.bin) &&
      context.options.plugins.cli.bin.length > 0
    ) {
      binConfig = context.options.plugins.cli.bin.reduce(
        (ret, binName) => {
          ret[kebabCase(binName)] =
            context.options.esbuild.format === "esm"
              ? `${joinPaths("dist", bin)}.mjs`
              : `${joinPaths("dist", bin)}.js`;
          return ret;
        },
        {} as Record<string, string>
      );
    } else {
      binConfig[kebabCase(bin)] =
        context.options.esbuild.format === "esm"
          ? `${joinPaths("dist", bin)}.mjs`
          : `${joinPaths("dist", bin)}.js`;
    }

    await writeFile(
      log,
      joinPaths(
        context.options.workspaceRoot,
        context.options.projectRoot,
        "package.json"
      ),
      StormJSON.stringify(
        defu(
          {
            bin: binConfig
          },
          packageJson
        )
      )
    );

    log(
      LogLevelLabel.TRACE,
      `Writing the following commands to the artifacts directory: ${context.entryPath}`
    );

    context.entry = Object.keys(commandsDict).reduce((ret, command) => {
      if (!commandsDict[command]) {
        log(
          LogLevelLabel.WARN,
          `No command file found for ${command}. Please ensure this is correct.`
        );
        return ret;
      }

      let entryFile = joinPaths(context.entryPath, commandsDict[command]);
      if (findFileName(entryFile) !== "index.ts") {
        entryFile = joinPaths(
          findFilePath(entryFile),
          findFileName(entryFile).replace(
            findFileExtension(entryFile) || "",
            ""
          ),
          "index.ts"
        );
      }

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
          output: command,
          path: findFilePath(entryFile)
            .replace(context.entryPath, "")
            .replaceAll(/\/+$/g, "")
            .split("/")
            .filter(Boolean),
          isVirtual: false
        });
      }

      return ret;
    }, context.entry);

    log(
      LogLevelLabel.TRACE,
      "Adding the CLI completion commands to the entry points."
    );

    if (
      context.entry.some(
        entry =>
          entry.output === "completions" ||
          entry.file === joinPaths(context.entryPath, "completions", "index.ts")
      )
    ) {
      throw new Error(
        "The completions command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
      );
    }

    context.entry.push({
      title: "CLI Completions",
      description: `Commands for generating shell completion scripts for the ${titleCase(context.options.name)}.`,
      file: joinPaths(context.entryPath, "completions", "index.ts"),
      input: {
        file: joinPaths(context.entryPath, "completions", "index.ts")
      },
      output: "completions",
      path: ["completions"],
      isVirtual: true
    });

    if (
      context.entry.some(
        entry =>
          entry.output === "completions-bash" ||
          entry.file ===
            joinPaths(context.entryPath, "completions", "bash", "index.ts")
      )
    ) {
      throw new Error(
        "The completions-bash command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
      );
    }

    context.entry.push({
      title: "CLI Completions - Bash Shell",
      file: joinPaths(context.entryPath, "completions", "bash", "index.ts"),
      input: {
        file: joinPaths(context.entryPath, "completions", "bash", "handle.ts")
      },
      output: "completions-bash",
      path: ["completions", "bash"],
      isVirtual: false
    });

    if (
      context.entry.some(
        entry =>
          entry.output === "completions-zsh" ||
          entry.file ===
            joinPaths(context.entryPath, "completions", "zsh", "index.ts")
      )
    ) {
      throw new Error(
        "The completions-zsh command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
      );
    }

    context.entry.push({
      title: "CLI Completions - Zsh Shell",
      file: joinPaths(context.entryPath, "completions", "zsh", "index.ts"),
      input: {
        file: joinPaths(context.entryPath, "completions", "zsh", "handle.ts")
      },
      output: "completions-zsh",
      path: ["completions", "zsh"],
      isVirtual: false
    });

    // if (config.manageConfig !== false) {
    //   log(
    //     LogLevelLabel.TRACE,
    //     "Adding the configuration management commands to the entry points."
    //   );

    //   if (
    //     context.entry.some(
    //       entry =>
    //         entry.output === "config" ||
    //         entry.file === joinPaths(context.entryPath, "config", "index.ts")
    //     )
    //   ) {
    //     throw new Error(
    //       "The config command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
    //     );
    //   }

    //   context.entry.push({
    //     title: "Configuration Management",
    //     description:
    //       "Commands for managing the configuration parameters stored on the file system.",
    //     file: joinPaths(context.entryPath, "config", "index.ts"),
    //     input: {
    //       file: joinPaths(context.entryPath, "config", "index.ts")
    //     },
    //     output: "config",
    //     path: ["config"],
    //     isVirtual: true
    //   });

    //   if (
    //     context.entry.some(
    //       entry =>
    //         entry.output === "config-get" ||
    //         entry.file ===
    //           joinPaths(context.entryPath, "config", "get", "index.ts")
    //     )
    //   ) {
    //     throw new Error(
    //       "The config-get command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
    //     );
    //   }

    //   context.entry.push({
    //     title: "Configuration - Get",
    //     file: joinPaths(context.entryPath, "config", "get", "index.ts"),
    //     input: {
    //       file: joinPaths(context.entryPath, "config", "get", "handle.ts")
    //     },
    //     output: "config-get-[name]",
    //     path: ["config", "get", "[name]"],
    //     isVirtual: false
    //   });

    //   if (
    //     context.entry.some(
    //       entry =>
    //         entry.output === "config-set" ||
    //         entry.file ===
    //           joinPaths(context.entryPath, "config", "set", "index.ts")
    //     )
    //   ) {
    //     throw new Error(
    //       "The config-set command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
    //     );
    //   }

    //   context.entry.push({
    //     title: "Configuration - Set",
    //     file: joinPaths(context.entryPath, "config", "set", "index.ts"),
    //     input: {
    //       file: joinPaths(context.entryPath, "config", "set", "handle.ts")
    //     },
    //     output: "config-set-[name]-[value]",
    //     path: ["config", "set", "[name]", "[value]"],
    //     isVirtual: false
    //   });

    //   if (
    //     context.entry.some(
    //       entry =>
    //         entry.output === "config-delete" ||
    //         entry.file ===
    //           joinPaths(context.entryPath, "config", "delete", "index.ts")
    //     )
    //   ) {
    //     throw new Error(
    //       "The config-delete command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
    //     );
    //   }

    //   context.entry.push({
    //     title: "Configuration - Delete",
    //     file: joinPaths(context.entryPath, "config", "delete", "index.ts"),
    //     input: {
    //       file: joinPaths(context.entryPath, "config", "delete", "handle.ts")
    //     },
    //     output: "config-delete-[name]",
    //     path: ["config", "delete", "[name]"],
    //     isVirtual: false
    //   });

    //   if (
    //     context.entry.some(
    //       entry =>
    //         entry.output === "config-list" ||
    //         entry.file ===
    //           joinPaths(context.entryPath, "config", "list", "index.ts")
    //     )
    //   ) {
    //     throw new Error(
    //       "The config-list command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
    //     );
    //   }

    //   context.entry.push({
    //     title: "Configuration - List",
    //     file: joinPaths(context.entryPath, "config", "list", "index.ts"),
    //     input: {
    //       file: joinPaths(context.entryPath, "config", "list", "handle.ts")
    //     },
    //     output: "config-list",
    //     path: ["config", "list"],
    //     isVirtual: false
    //   });
    // }

    log(
      LogLevelLabel.TRACE,
      "Finding and adding virtual commands to the entry points."
    );

    context.entry = context.entry
      .filter(
        entry => entry.input.file !== context.options.entry && entry.output
      )
      .reduce((ret, entry) => {
        const entryPath = findFilePath(entry.file);
        let parentPath = resolveParentPath(entryPath);
        while (parentPath !== context.entryPath) {
          const parentFolderName = findFolderName(parentPath);
          if (
            !ret.some(existing => findFilePath(existing.file) === parentPath) &&
            (!parentFolderName.startsWith("[") ||
              !parentFolderName.endsWith("]"))
          ) {
            ret.push({
              file: joinPaths(parentPath, "index.ts"),
              input: {
                file: joinPaths(parentPath, "index.ts")
              },
              output: parentFolderName,
              path: parentPath
                .replace(context.entryPath, "")
                .split("/")
                .filter(Boolean),
              isVirtual: true
            });
          }

          parentPath = resolveParentPath(parentPath);
        }

        return ret;
      }, context.entry);

    log(
      LogLevelLabel.TRACE,
      `Using the following commands entry points: \n${context.entry
        .map(
          entry =>
            ` - ${entry.output}: ${entry.file}${entry.isVirtual ? " (virtual)" : ""}`
        )
        .join("\n")}`
    );
  }
}

export async function initReflections(log: LogFn, context: CLIPluginContext) {
  if (
    context.options.command !== "prepare" &&
    context.persistedMeta?.checksum === context.meta.checksum &&
    existsSync(getCommandReflectionsPath(context)) &&
    (await listFiles(getCommandReflectionsPath(context))).length > 0
  ) {
    log(
      LogLevelLabel.TRACE,
      `Skipping reflection initialization as the meta checksum has not changed.`
    );

    context.reflections.cli = await readAllCommandsReflection(context);
  }
}
