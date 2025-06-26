/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { LogFn } from "@storm-stack/core/types";
import { readJsonFile } from "@stryke/fs/json";
import { listFiles } from "@stryke/fs/list-files";
import { StormJSON } from "@stryke/json/storm-json";
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
import { defu } from "defu";
import { StormStackCLIPluginContext } from "../types/build";
import type { StormStackCLIPluginConfig } from "../types/config";

export async function initContext(
  context: StormStackCLIPluginContext,
  config: StormStackCLIPluginConfig
) {
  context.options.esbuild.override ??= {};
  context.options.alias ??= {};

  context.options.alias["storm:app"] ??= joinPaths(context.runtimePath, "app");
  context.options.alias["storm:context"] ??= joinPaths(
    context.runtimePath,
    "context"
  );
  context.options.alias["storm:env"] ??= joinPaths(context.runtimePath, "env");
  context.options.alias["storm:event"] ??= joinPaths(
    context.runtimePath,
    "event"
  );
  context.options.alias["storm:cli"] = joinPaths(context.runtimePath, "cli");

  context.options.platform = "node";
  context.options.environment = "cli";

  context.options.external ??= [];
  context.options.noExternal ??= [];
  if (Array.isArray(context.options.noExternal)) {
    context.options.noExternal.push(
      "storm:app",
      "storm:context",
      "storm:env",
      "storm:event",
      "storm:cli"
    );
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

export async function initInstalls(
  context: StormStackCLIPluginContext,
  config: StormStackCLIPluginConfig
) {
  if (
    context.options.projectType === "application" &&
    config.interactive !== "never"
  ) {
    context.installs["@clack/prompts@0.10.1"] = "dependency";
  }
}

export async function initUnimport(
  context: StormStackCLIPluginContext,
  config: StormStackCLIPluginConfig
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
    from: joinPaths(context.runtimePath, "cli")
  });
}

export async function initEntry(
  log: LogFn,
  context: StormStackCLIPluginContext,
  config: StormStackCLIPluginConfig
) {
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
          context.workspaceConfig.workspaceRoot,
          context.options.projectRoot,
          "package.json"
        )
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
      joinPaths(
        context.workspaceConfig.workspaceRoot,
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

    const commandsDirectory = joinPaths(context.artifactsPath, "commands");

    log(
      LogLevelLabel.TRACE,
      `Writing the following commands to the artifacts directory: ${commandsDirectory}`
    );

    context.entry = Object.keys(commandsDict).reduce((ret, command) => {
      if (!commandsDict[command]) {
        log(
          LogLevelLabel.WARN,
          `No command file found for ${command}. Please ensure this is correct.`
        );
        return ret;
      }

      let entryFile = joinPaths(commandsDirectory, commandsDict[command]);
      if (findFileName(entryFile) !== "index.ts") {
        entryFile = joinPaths(
          findFilePath(entryFile),
          findFileName(entryFile).replace(findFileExtension(entryFile), ""),
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
            .replace(commandsDirectory, "")
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
          entry.file === joinPaths(commandsDirectory, "completions", "index.ts")
      )
    ) {
      throw new Error(
        "The completions command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
      );
    }

    context.entry.push({
      title: "CLI Completions",
      description: `Commands for generating shell completion scripts for the ${titleCase(context.options.name)}.`,
      file: joinPaths(commandsDirectory, "completions", "index.ts"),
      input: {
        file: joinPaths(commandsDirectory, "completions", "index.ts")
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
            joinPaths(commandsDirectory, "completions", "bash", "index.ts")
      )
    ) {
      throw new Error(
        "The completions-bash command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
      );
    }

    context.entry.push({
      title: "CLI Completions - Bash Shell",
      file: joinPaths(commandsDirectory, "completions", "bash", "index.ts"),
      input: {
        file: joinPaths(commandsDirectory, "completions", "bash", "handle.ts")
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
            joinPaths(commandsDirectory, "completions", "zsh", "index.ts")
      )
    ) {
      throw new Error(
        "The completions-zsh command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
      );
    }

    context.entry.push({
      title: "CLI Completions - Zsh Shell",
      file: joinPaths(commandsDirectory, "completions", "zsh", "index.ts"),
      input: {
        file: joinPaths(commandsDirectory, "completions", "zsh", "handle.ts")
      },
      output: "completions-zsh",
      path: ["completions", "zsh"],
      isVirtual: false
    });

    if (config.manageConfig !== false) {
      log(
        LogLevelLabel.TRACE,
        "Adding the configuration management commands to the entry points."
      );

      if (
        context.entry.some(
          entry =>
            entry.output === "config" ||
            entry.file === joinPaths(commandsDirectory, "config", "index.ts")
        )
      ) {
        throw new Error(
          "The config command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
        );
      }

      context.entry.push({
        title: "Configuration Management",
        description:
          "Commands for managing the configuration parameters stored on the file system.",
        file: joinPaths(commandsDirectory, "config", "index.ts"),
        input: {
          file: joinPaths(commandsDirectory, "config", "index.ts")
        },
        output: "config",
        path: ["config"],
        isVirtual: true
      });

      if (
        context.entry.some(
          entry =>
            entry.output === "config-get" ||
            entry.file ===
              joinPaths(commandsDirectory, "config", "get", "index.ts")
        )
      ) {
        throw new Error(
          "The config-get command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
        );
      }

      context.entry.push({
        title: "Configuration - Get",
        file: joinPaths(commandsDirectory, "config", "get", "index.ts"),
        input: {
          file: joinPaths(commandsDirectory, "config", "get", "handle.ts")
        },
        output: "config-get-[name]",
        path: ["config", "get", "[name]"],
        isVirtual: false
      });

      if (
        context.entry.some(
          entry =>
            entry.output === "config-set" ||
            entry.file ===
              joinPaths(commandsDirectory, "config", "set", "index.ts")
        )
      ) {
        throw new Error(
          "The config-set command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
        );
      }

      context.entry.push({
        title: "Configuration - Set",
        file: joinPaths(commandsDirectory, "config", "set", "index.ts"),
        input: {
          file: joinPaths(commandsDirectory, "config", "set", "handle.ts")
        },
        output: "config-set-[name]-[value]",
        path: ["config", "set", "[name]", "[value]"],
        isVirtual: false
      });

      if (
        context.entry.some(
          entry =>
            entry.output === "config-delete" ||
            entry.file ===
              joinPaths(commandsDirectory, "config", "delete", "index.ts")
        )
      ) {
        throw new Error(
          "The config-delete command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
        );
      }

      context.entry.push({
        title: "Configuration - Delete",
        file: joinPaths(commandsDirectory, "config", "delete", "index.ts"),
        input: {
          file: joinPaths(commandsDirectory, "config", "delete", "handle.ts")
        },
        output: "config-delete-[name]",
        path: ["config", "delete", "[name]"],
        isVirtual: false
      });

      if (
        context.entry.some(
          entry =>
            entry.output === "config-list" ||
            entry.file ===
              joinPaths(commandsDirectory, "config", "list", "index.ts")
        )
      ) {
        throw new Error(
          "The config-list command already exists in the entry point. This is not valid when \`manageConfig\` is not false. Please remove it from the entry point or rename it."
        );
      }

      context.entry.push({
        title: "Configuration - List",
        file: joinPaths(commandsDirectory, "config", "list", "index.ts"),
        input: {
          file: joinPaths(commandsDirectory, "config", "list", "handle.ts")
        },
        output: "config-list",
        path: ["config", "list"],
        isVirtual: false
      });
    }

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
        while (parentPath !== commandsDirectory) {
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
                .replace(commandsDirectory, "")
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
