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
  ReflectionParameter
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { resolveType } from "@storm-stack/core/helpers/deepkit/reflect-type";
import type { LogFn } from "@storm-stack/core/types";
import type { ResolvedEntryTypeDefinition } from "@storm-stack/core/types/build";
import { findFolderName } from "@stryke/path/file-path-fns";
import { resolveParentPath } from "@stryke/path/get-parent-path";
import { titleCase } from "@stryke/string-format/title-case";
import { writeCommandTreeReflection } from "../capnp/persistence";
import { CommandPayload } from "../data/command-payload";
import { StormStackCLIPresetContext } from "../types/build";
import type { StormStackCLIPresetConfig } from "../types/config";
import { Command, CommandTree } from "../types/reflection";
import {
  findCommandInTree,
  getAppName,
  getAppTitle,
  reflectPayloadBaseType
} from "./utilities";

function findCommandName(entry: ResolvedEntryTypeDefinition) {
  let name = findFolderName(entry.file);
  let count = 1;

  while (name.startsWith("[") && name.endsWith("]")) {
    name = findFolderName(resolveParentPath(entry.file, count++));
  }

  return name;
}

interface CommandRelations {
  parent: string | null;
  children: string[];
}

async function reflectRelations(
  context: StormStackCLIPresetContext
): Promise<Record<string, CommandRelations>> {
  const relationReflections = {} as Record<string, CommandRelations>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry && entry.output
  )) {
    const commandId = entry.output;
    relationReflections[commandId] ??= {
      parent: null,
      children: []
    } as CommandRelations;

    let path = entry.path;
    while (path.length > 1) {
      path = path
        .filter(part => !part.startsWith("[") && !part.endsWith("]"))
        .slice(0, -1);
      const parentId = path.join("-");
      if (context.entry.some(entry => entry.output === parentId)) {
        relationReflections[commandId].parent = parentId;

        relationReflections[parentId] ??= {
          parent: null,
          children: []
        } as CommandRelations;
        relationReflections[parentId].children.push(commandId);
      }
    }
  }

  return relationReflections;
}

async function reflectPayloads(
  context: StormStackCLIPresetContext,
  config: StormStackCLIPresetConfig
): Promise<Record<string, CommandPayload>> {
  const payloadReflections = {} as Record<string, CommandPayload>;
  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry && entry.output
  )) {
    if (entry.isVirtual) {
      const payloadBaseType = await reflectPayloadBaseType(context);

      payloadReflections[entry.output] = CommandPayload.from(
        config,
        {
          entry,
          name: findCommandName(entry),
          title: titleCase(findCommandName(entry))
        },
        payloadBaseType
      );
    } else {
      // eslint-disable-next-line ts/no-unsafe-function-type
      const command = await resolveType<Function>(context, entry.input, {});
      if (!command) {
        throw new Error(`Module not found: ${entry.input.file}`);
      }

      const commandReflection = ReflectionFunction.from(command);
      if (!commandReflection) {
        throw new Error(`Reflection not found: ${entry.input.file}`);
      }

      const name = findCommandName(entry);
      payloadReflections[entry.output] = CommandPayload.from(config, {
        entry,
        name,
        title: titleCase(name),
        type: commandReflection
      });
    }
  }

  return payloadReflections;
}

type CommandReflectionDefinition = Omit<
  Command,
  "parent" | "children" | "root"
> & {
  payload: CommandPayload;
  relations: CommandRelations;
};

async function reflectCommand(
  log: LogFn,
  context: StormStackCLIPresetContext,
  config: StormStackCLIPresetConfig
): Promise<Record<string, CommandReflectionDefinition>> {
  const relationsReflections = await reflectRelations(context);
  const payloadsReflections = await reflectPayloads(context, config);

  const reflections = {} as Record<string, CommandReflectionDefinition>;

  for (const entry of context.entry.filter(
    entry => entry.input.file !== context.options.entry
  )) {
    if (!entry.output) {
      throw new Error(
        `The entry "${entry.input.file}" does not have an output defined. Please ensure the entry has a valid output path.`
      );
    }

    if (!relationsReflections[entry.output]) {
      throw new Error(
        `Unable to determine relation reflections for command "${entry.output}".`
      );
    }
    if (!payloadsReflections[entry.output]) {
      throw new Error(
        `Unable to determine payload reflections for command "${entry.output}".`
      );
    }

    if (entry.isVirtual) {
      const name = findCommandName(entry);

      const command = {
        id: entry.output,
        type: new ReflectionFunction({
          kind: ReflectionKind.function,
          name: "handler",
          description: entry.description,
          parameters: [],
          return: {
            kind: ReflectionKind.any
          },
          tags: {
            title: entry.title || titleCase(name)
          }
        }),
        title: entry.title || titleCase(name),
        name: entry.output,
        entry,
        payload: payloadsReflections[entry.output]!,
        relations: relationsReflections[entry.output]!
      };

      command.type.parameters.push(
        new ReflectionParameter(
          {
            kind: ReflectionKind.parameter,
            name: "payload",
            parent: command.type.type,
            type: payloadsReflections[entry.output]!.type.type,
            description: `The payload for the ${titleCase(name)} command.`,
            tags: {
              title: `Payload for ${titleCase(name)} command`
            }
          },
          command.type
        )
      );

      reflections[entry.output] = command;
    } else {
      log(
        LogLevelLabel.TRACE,
        `Precompiling the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
      );

      // eslint-disable-next-line ts/no-unsafe-function-type
      const command = await resolveType<Function>(context, entry.input);
      if (!command) {
        throw new Error(`Module not found: ${entry.input.file}`);
      }

      const commandReflection = ReflectionFunction.from(command);
      if (!commandReflection) {
        throw new Error(`Reflection not found: ${entry.input.file}`);
      }

      const id = entry.output;
      const name = findCommandName(entry);

      reflections[id] = {
        id,
        name,
        type: commandReflection,
        title: titleCase(name),
        entry,
        payload: payloadsReflections[id]!,
        relations: relationsReflections[id]!
      };
    }
  }

  return reflections;
}

export async function reflectCommandTree(
  log: LogFn,
  context: StormStackCLIPresetContext,
  config: StormStackCLIPresetConfig
): Promise<CommandTree> {
  const reflections = await reflectCommand(log, context, config);

  const name = getAppName(context, config);
  const tree = {
    name,
    title: getAppTitle(context, config),
    bin: config.bin
      ? Array.isArray(config.bin)
        ? config.bin
        : [config.bin]
      : [name],
    description:
      context.options.description || context.packageJson?.description,
    entry: context.entry.find(
      entry => entry.input.file === context.options.entry
    ),
    parent: null,
    children: {}
  } as CommandTree;

  const addCommand = (
    tree: CommandTree,
    reflection: CommandReflectionDefinition
  ): Command => {
    let command = findCommandInTree(tree, reflection.entry.path) as
      | Command
      | undefined;
    if (!command) {
      if (reflection.entry.path.length === 1) {
        command = {
          ...reflection,
          parent: tree,
          children: {},
          root: tree
        };
        tree.children[command.name] = command;
      } else {
        let parent: Command | CommandTree = tree;
        if (reflection.relations.parent) {
          const parentReflection = reflections[reflection.relations.parent];
          if (!parentReflection) {
            throw new Error(
              `Reflection not found for command "${
                reflection.relations.parent
              }" in the ${parent.name} command tree.`
            );
          }

          parent = addCommand(tree, parentReflection);
        }

        command = {
          ...reflection,
          title:
            parent.title && parent.parent !== null
              ? titleCase(`${parent.title} - ${reflection.title}`)
              : reflection.title,
          parent,
          children: {},
          root: tree
        };

        parent.children[command.name] = command;
      }

      if (command.type) {
        if (reflection.entry.title) {
          const tags = command.type.getTags();
          tags.title = reflection.entry.title;

          command.type.setTags(tags);
        }

        if (reflection.entry.description) {
          command.type.description = reflection.entry.description;
        }
      }
    }

    return command;
  };

  Object.keys(reflections)
    .filter(commandId => reflections[commandId])
    .sort((a, b) => b.localeCompare(a))
    .forEach(commandId => {
      addCommand(tree, reflections[commandId]!);
    });

  await writeCommandTreeReflection(context, tree);

  return tree;
}
