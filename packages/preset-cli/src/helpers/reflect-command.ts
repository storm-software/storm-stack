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
import type {
  Options,
  ResolvedEntryTypeDefinition
} from "@storm-stack/core/types/build";
import { StormJSON } from "@stryke/json/storm-json";
import { findFolderName } from "@stryke/path/file-path-fns";
import { resolveParentPath } from "@stryke/path/get-parent-path";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type { StormStackCLIPresetContext } from "../types/build";
import type { StormStackCLIPresetConfig } from "../types/config";
import type {
  CommandEntryTypeDefinition,
  CommandPayloadArgReflection,
  CommandPayloadReflection,
  CommandReflection,
  CommandReflectionTree,
  CommandReflectionTreeBranch,
  CommandRelationsReflection
} from "../types/reflection";

function findCommandName(entry: ResolvedEntryTypeDefinition) {
  let name = findFolderName(entry.file);
  let count = 1;

  while (name.startsWith("[") && name.endsWith("]")) {
    name = findFolderName(resolveParentPath(entry.file, count++));
  }

  return name;
}

async function reflectCommandRelations<TOptions extends Options = Options>(
  context: StormStackCLIPresetContext<TOptions>
): Promise<Record<string, CommandRelationsReflection>> {
  const relationReflections = {} as Record<string, CommandRelationsReflection>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry && entry.output
  )) {
    const commandId = entry.output;
    relationReflections[commandId] ??= {
      parent: undefined,
      children: []
    } as CommandRelationsReflection;

    const commandName = findCommandName(entry);
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

function getDefaultCommandPayloadArgs(
  entry: CommandEntryTypeDefinition,
  config: StormStackCLIPresetConfig
): CommandPayloadArgReflection[] {
  return [
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
    !entry.isVirtual &&
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
    !entry.isVirtual &&
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
    !entry.isVirtual && {
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
  ].filter(Boolean) as CommandPayloadArgReflection[];
}

async function reflectCommandPayloads<TOptions extends Options = Options>(
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
): Promise<Record<string, CommandPayloadReflection>> {
  const payloadReflections = {} as Record<string, CommandPayloadReflection>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry && entry.output
  )) {
    if (entry.isVirtual) {
      payloadReflections[entry.output] = {
        name: `${titleCase(entry.output)}Payload`,
        args: getDefaultCommandPayloadArgs(entry, config)
      };
    } else {
      // eslint-disable-next-line ts/no-unsafe-function-type
      const command = await resolveType<TOptions, Function>(
        context,
        entry.input,
        {}
      );
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
            parameter.kind === ReflectionKind.objectLiteral)
        ) {
          const resolvedParameter = resolveClassType(parameter);
          if (!resolvedParameter) {
            throw new Error(
              `The command "${entry.output}" does not have a valid payload type.`
            );
          }

          const dataProperty = resolvedParameter.getProperty("data");
          if (!dataProperty) {
            throw new Error(
              `The command "${entry.output}" does not have a "data" property in its payload.`
            );
          }

          if (
            dataProperty.getType().kind !== ReflectionKind.class &&
            dataProperty.getType().kind !== ReflectionKind.objectLiteral
          ) {
            throw new Error(
              `The command "${entry.output}" does not have a valid "data" property type. Expected a class or object literal, but got ${dataProperty.getKind()}.`
            );
          }

          const resolvedProperty = resolveClassType(dataProperty.getType());

          const commandId = entry.output;
          payloadReflections[commandId] = {
            name: resolvedProperty.getName(),
            args: resolvedProperty.getProperties().reduce(
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
                    description: description.endsWith(".")
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
                        default: false,
                        isNegative: true
                      });
                    }
                  }
                }

                return ret;
              },
              getDefaultCommandPayloadArgs(entry, config)
            )
          } as CommandPayloadReflection;
        }
      }
    }
  }

  return payloadReflections;
}

export async function reflectCommand<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
): Promise<Record<string, CommandReflection>> {
  const relationsReflections = await reflectCommandRelations(context);
  const payloadsReflections = await reflectCommandPayloads(context, config);

  const reflections = {} as Record<string, CommandReflection>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry
  )) {
    if (entry.isVirtual) {
      const displayName = entry.displayName || titleCase(entry.output);
      reflections[entry.output] = {
        commandId: entry.output,
        name: entry.output,
        displayName,
        description:
          entry.description ||
          `A set of ${displayName} commands that can be executed in the CLI.`,
        aliases: [],
        entry,
        payload: payloadsReflections[entry.output],
        relations: relationsReflections[entry.output]
      } as CommandReflection;
    } else {
      log(
        LogLevelLabel.TRACE,
        `Precompiling the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
      );

      // eslint-disable-next-line ts/no-unsafe-function-type
      const command = await resolveType<TOptions, Function>(
        context,
        entry.input
      );
      if (!command) {
        throw new Error(`Module not found: ${entry.input.file}`);
      }

      const commandReflection = ReflectionFunction.from(command);
      if (!commandReflection) {
        throw new Error(`Reflection not found: ${entry.input.file}`);
      }

      const commandId = entry.output;
      const name = findCommandName(entry);
      const relations = relationsReflections[commandId];

      reflections[commandId] = {
        commandId,
        name,
        displayName: entry.displayName || titleCase(name),
        description:
          entry.description ||
          (commandReflection.description &&
          !commandReflection.description?.endsWith(".") &&
          !commandReflection.description?.endsWith("?")
            ? `${commandReflection.description}.`
            : commandReflection.description),
        aliases: [],
        entry,
        payload: payloadsReflections[commandId],
        relations
      } as CommandReflection;
    }
  }

  Object.keys(reflections)
    .filter(commandId => reflections[commandId]?.relations.parent)
    .sort((a, b) => b.localeCompare(a))
    .forEach(commandId => {
      const reflection = reflections[commandId];

      if (reflection?.relations.parent) {
        const parent = reflections[reflection.relations.parent];
        if (parent) {
          reflection.displayName =
            reflection.entry.displayName ||
            titleCase(`${parent.displayName} - ${reflection.displayName}`);
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
  context: StormStackCLIPresetContext<TOptions>,
  config: StormStackCLIPresetConfig
): Promise<CommandReflectionTree> {
  let reflections = {};
  // if (
  //   context.persistedMeta?.checksum === context.meta.checksum &&
  //   existsSync(joinPaths(getReflectionsPath(context), "cli.json"))
  // ) {
  //   reflections = await readJsonFile(
  //     joinPaths(getReflectionsPath(context), "cli.json")
  //   );
  // } else {
  reflections = await reflectCommand(log, context, config);
  // }

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
    displayName: titleCase(context.options.name || appName),
    description: context.packageJson?.description,
    entry: context.entry.find(
      entry => entry.input.file === context.options.entry
    ),
    parent: null,
    children: {}
  } as CommandReflectionTree;

  Object.keys(reflections)
    .filter(commandId => !reflections[commandId]?.relations.parent)
    .sort((a, b) => b.localeCompare(a))
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
    .sort((a, b) => b.localeCompare(a))
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
