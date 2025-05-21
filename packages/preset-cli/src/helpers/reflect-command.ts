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

import {
  ReflectionFunction,
  ReflectionKind,
  resolveClassType,
  serializeType,
  stringifyType
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { resolveType } from "@storm-stack/core/helpers/deepkit/reflect-type";
import { getReflectionsPath } from "@storm-stack/core/helpers/deepkit/resolve-reflections";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { LogFn } from "@storm-stack/core/types";
import type { Context, Options } from "@storm-stack/core/types/build";
import { readJsonFile } from "@stryke/fs/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import { findFilePath, findFolderName } from "@stryke/path/file-path-fns";
import { isRelativePath } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { loadFile } from "magicast";
import type { StormStackCLIPresetConfig } from "../types/config";
import type {
  CommandPayloadArgReflection,
  CommandPayloadReflection,
  CommandReflection,
  CommandReflectionTree,
  CommandReflectionTreeBranch,
  CommandRelationsReflection
} from "../types/reflection";

async function reflectCommandRelations<TOptions extends Options = Options>(
  context: Context<TOptions>
): Promise<Record<string, CommandRelationsReflection>> {
  const relationReflections = {} as Record<string, CommandRelationsReflection>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry && entry.output
  )) {
    const commandId = entry.output!;
    relationReflections[commandId] ??= {
      parent: undefined,
      children: []
    } as CommandRelationsReflection;

    const commandName = findFolderName(entry.file);
    if (commandId !== commandName) {
      const parent = commandId.replace(commandName, "").replaceAll(/-+$/g, "");
      if (context.entry.some(entry => entry.output === parent)) {
        relationReflections[parent] ??= {
          parent: undefined,
          children: []
        } as CommandRelationsReflection;
        relationReflections[parent].children.push(commandId);

        relationReflections[commandId].parent = parent;
      }
    }
  }

  return relationReflections;
}

async function reflectCommandPayloads<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
): Promise<Record<string, CommandPayloadReflection>> {
  const payloadReflections = {} as Record<string, CommandPayloadReflection>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry && entry.output
  )) {
    const entryModule = await loadFile(entry.input.file);
    if (!entryModule) {
      throw new Error(`Failure loading module AST: ${entry.input.file}`);
    }

    // eslint-disable-next-line ts/no-unsafe-function-type
    const command = await resolveType<TOptions, Function>(context, entry.input);
    if (!command) {
      throw new Error(`Module not found: ${entry.input.file}`);
    }

    const commandReflection = ReflectionFunction.from(command);
    if (!commandReflection) {
      throw new Error(`Reflection not found: ${entry.input.file}`);
    }

    const parameters = commandReflection.getParameters();
    if (parameters && parameters.length > 0) {
      const parameter = parameters[0]?.getType();
      if (
        parameter &&
        (parameter.kind === ReflectionKind.class ||
          parameter.kind === ReflectionKind.objectLiteral) &&
        parameter.typeArguments &&
        parameter.typeArguments.length > 0
      ) {
        const payloadDataType = resolveClassType(parameter.typeArguments[0]!);

        let importPath = entryModule.imports[payloadDataType.getName()]?.from;
        if (importPath) {
          if (isRelativePath(importPath)) {
            importPath = joinPaths(findFilePath(entry.input.file), importPath);
          }
        } else if (entryModule.exports[payloadDataType.getName()]) {
          importPath = entry.input.file;
        }

        const commandId = entry.output!;
        payloadReflections[commandId] = {
          name: payloadDataType.getName(),
          importPath,
          args: payloadDataType.getProperties().reduce(
            (ret, property) => {
              const name = kebabCase(property.getNameAsString());
              if (!ret.some(item => item.name === name)) {
                const stringifiedType = stringifyType(property.getType());

                let type = stringifiedType;
                let options = undefined as string[] | number[] | undefined;
                if (type.includes("|")) {
                  options = type
                    .split("|")
                    .map(option =>
                      option.trim().replaceAll('"', "").replaceAll("'", "")
                    );
                  type = "enum";
                }

                const aliases = [] as string[];
                if (
                  name[0] &&
                  !ret.some(item =>
                    item.aliases.includes(name[0]!.toLowerCase())
                  )
                ) {
                  aliases.push(name[0].toLowerCase());
                }

                const description = property.getDescription();
                ret.push({
                  name,
                  displayName: titleCase(name),
                  aliases,
                  reflectionType: serializeType(property.getType()),
                  type,
                  stringifiedType,
                  options,
                  description:
                    description.endsWith(".") || description.endsWith("?")
                      ? description.slice(0, -1)
                      : description,
                  array: property.isArray(),
                  required:
                    !property.isOptional() &&
                    property.getDefaultValue() === undefined,
                  default: property.getDefaultValue()
                });

                if (type === "boolean") {
                  const inverseName = `no-${kebabCase(name)}`;
                  if (!ret.some(item => item.name === inverseName)) {
                    ret.push({
                      name: inverseName,
                      displayName: titleCase(inverseName),
                      aliases: [],
                      reflectionType: serializeType(property.getType()),
                      type: "boolean",
                      stringifiedType: "boolean",
                      options: [],
                      description: `The inverse of the ${name} option.`,
                      array: false,
                      required: false,
                      default: false
                    });
                  }
                }
              }

              return ret;
            },
            [
              {
                name: "help",
                displayName: "Help",
                description: "Show help information.",
                aliases: ["h", "?"],
                type: "boolean",
                stringifiedType: "boolean",
                reflectionType: serializeType({ kind: ReflectionKind.boolean }),
                options: [],
                array: false,
                required: false,
                default: false
              },
              {
                name: "version",
                displayName: "Version",
                description: "Show the version of the application.",
                aliases: ["v"],
                type: "boolean",
                stringifiedType: "boolean",
                reflectionType: serializeType({ kind: ReflectionKind.boolean }),
                options: [],
                array: false,
                required: false,
                default: false
              },
              config.interactive !== "never" &&
                config.interactive !== true && {
                  name: "interactive",
                  displayName: "Interactive",
                  description:
                    "Enable interactive mode (will be set to false if running in a CI pipeline).",
                  aliases: ["i", "interact"],
                  type: "boolean",
                  stringifiedType: "boolean",
                  reflectionType: serializeType({
                    kind: ReflectionKind.boolean
                  }),
                  options: [],
                  array: false,
                  required: false,
                  default: config.interactive !== false
                },
              config.interactive !== "never" &&
                config.interactive !== false && {
                  name: "no-interactive",
                  displayName: "No Interactive",
                  description:
                    "Disable interactive mode (will be set to true if running in a CI pipeline).",
                  aliases: ["no-interact"],
                  type: "boolean",
                  stringifiedType: "boolean",
                  reflectionType: serializeType({
                    kind: ReflectionKind.boolean
                  }),
                  options: [],
                  array: false,
                  required: false,
                  default: false
                },
              {
                name: "no-banner",
                displayName: "Hide Banner",
                description:
                  "Hide the banner displayed while running the CLI application (will be set to true if running in a CI pipeline).",
                aliases: [],
                type: "boolean",
                stringifiedType: "boolean",
                reflectionType: serializeType({ kind: ReflectionKind.boolean }),
                options: [],
                array: false,
                required: false,
                default: false
              },
              {
                name: "verbose",
                displayName: "Verbose",
                description: "Enable verbose output.",
                aliases: ["v"],
                type: "boolean",
                stringifiedType: "boolean",
                reflectionType: serializeType({ kind: ReflectionKind.boolean }),
                options: [],
                array: false,
                required: false,
                default: false
              }
            ].filter(Boolean) as CommandPayloadArgReflection[]
          )
        } as CommandPayloadReflection;
      }
    }
  }

  return payloadReflections;
}

function getCommandPath(
  command: CommandReflection,
  relationsReflections: Record<string, CommandRelationsReflection>,
  reflections: Record<string, CommandReflection>
) {
  const path = [] as string[];
  if (
    relationsReflections[command.commandId]?.parent &&
    reflections[relationsReflections[command.commandId]!.parent!]?.name &&
    reflections[command.commandId]?.name !==
      reflections[relationsReflections[command.commandId]!.parent!]?.name
  ) {
    path.push(
      ...getCommandPath(
        reflections[relationsReflections[command.commandId]!.parent!]!,
        relationsReflections,
        reflections
      ).map(command => kebabCase(command))
    );
  }

  path.push(command.name);

  return path;
}

export async function reflectCommand<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
): Promise<Record<string, CommandReflection>> {
  const relationsReflections = await reflectCommandRelations(context);
  const payloadsReflections = await reflectCommandPayloads(context, config);

  const reflections = {} as Record<string, CommandReflection>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry
  )) {
    log(
      LogLevelLabel.TRACE,
      `Precompiling the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
    );

    const entryModule = await loadFile(entry.input.file);
    if (!entryModule) {
      throw new Error(`Failure loading module AST: ${entry.input.file}`);
    }

    // eslint-disable-next-line ts/no-unsafe-function-type
    const command = await resolveType<TOptions, Function>(context, entry.input);
    if (!command) {
      throw new Error(`Module not found: ${entry.input.file}`);
    }

    const commandReflection = ReflectionFunction.from(command);
    if (!commandReflection) {
      throw new Error(`Reflection not found: ${entry.input.file}`);
    }

    const commandId = entry.output!;
    const name = findFolderName(entry.file);
    const relations = relationsReflections[commandId];

    reflections[commandId] = {
      commandId,
      path: [name],
      name,
      displayName: titleCase(name),
      description:
        commandReflection.description &&
        !commandReflection.description?.endsWith(".") &&
        !commandReflection.description?.endsWith("?")
          ? `${commandReflection.description}.`
          : commandReflection.description,
      aliases: [],
      entry,
      payload: payloadsReflections[commandId],
      relations
    } as CommandReflection;
  }

  Object.keys(reflections)
    .filter(commandId => reflections[commandId]?.relations.parent)
    .sort((a, b) => a.localeCompare(b))
    .forEach(commandId => {
      const reflection = reflections[commandId];
      if (reflection) {
        reflection.path = getCommandPath(
          reflection,
          relationsReflections,
          reflections
        );

        if (reflection?.relations.parent) {
          const parent = reflections[reflection.relations.parent];
          if (parent) {
            reflection.displayName = titleCase(
              `${parent.displayName} - ${reflection.displayName}`
            );
          }
        }
      }
    });

  await writeFile(
    log,
    joinPaths(getReflectionsPath(context), "cli.json"),
    StormJSON.stringify(reflections)
  );

  return reflections;
}

export async function reflectCommandTree<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
): Promise<CommandReflectionTree> {
  let reflections = {};
  if (
    context.persistedMeta?.checksum === context.meta.checksum &&
    existsSync(joinPaths(getReflectionsPath(context), "cli.json"))
  ) {
    reflections = await readJsonFile(
      joinPaths(getReflectionsPath(context), "cli.json")
    );
  } else {
    reflections = await reflectCommand(log, context, config);
  }

  const appName =
    config.bin &&
    (isSetString(config.bin) ||
      (Array.isArray(config.bin) && config.bin.length > 0 && config.bin[0]))
      ? isSetString(config.bin)
        ? config.bin
        : config.bin[0]
      : context.options.name || context.packageJson?.name;
  const tree = {
    name: appName,
    displayName: titleCase(appName),
    description: context.packageJson?.description,
    entry: context.entry.find(
      entry => entry.input.file === context.options.entry
    ),
    parent: null,
    children: {}
  } as CommandReflectionTree;

  Object.keys(reflections)
    .filter(commandId => !reflections[commandId]?.relations.parent)
    .sort((a, b) => a.localeCompare(b))
    .forEach(commandId => {
      const reflection = reflections[commandId];
      tree.children[commandId] = {
        ...reflection,
        parent: tree,
        children: {}
      } as CommandReflectionTreeBranch;
    });

  Object.keys(reflections)
    .filter(commandId => reflections[commandId]?.relations.parent)
    .sort((a, b) => a.localeCompare(b))
    .forEach(commandId => {
      const reflection = reflections[commandId];
      if (reflection?.relations.parent) {
        const parent = tree.children[reflection.relations.parent];
        if (parent) {
          parent.children[commandId] = {
            parent,
            children: {},
            ...reflection
          } as CommandReflectionTreeBranch;
        }
      }
    });

  return tree;
}
