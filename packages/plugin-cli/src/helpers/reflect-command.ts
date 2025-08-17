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

import type { ResolvedEntryTypeDefinition } from "@storm-stack/core/types/build";
import type { LogFn } from "@storm-stack/core/types/config";
import { writeConfigTypeReflection } from "@storm-stack/plugin-config/helpers/persistence";
import { findFolderName } from "@stryke/path/file-path-fns";
import { resolveParentPath } from "@stryke/path/get-parent-path";
import { Command } from "../data/command";
import type { CLIPluginContext } from "../types/config";
import {
  CommandRelations,
  CommandTree,
  CommandTreeBranch
} from "../types/reflection";
import { findCommandInTree, getAppName, getAppTitle } from "./utilities";

// async function reflectPayloads(
//   context: CLIPluginContext
// ): Promise<Record<string, CommandPayload>> {
//   const payloadReflections = {} as Record<string, CommandPayload>;
//   for (const entry of context.entry.filter(
//     entry => entry.input.file !== context.options.entry && entry.output
//   )) {
//     if (entry.isVirtual) {
//       const payloadBaseType = await reflectPayloadBaseType(context);

//       payloadReflections[entry.output] = CommandPayload.from(
//         context,
//         {
//           entry,
//           name: findCommandName(entry),
//           title: titleCase(findCommandName(entry))
//         },
//         payloadBaseType
//       );
//     } else {
//       // eslint-disable-next-line ts/no-unsafe-function-type
//       const command = await resolveType<Function>(context, entry.input, {
//         outputPath: context.options.workspaceRoot,
//         skipNodeModulesBundle: true,
//         noExternal: context.options.noExternal,
//         external: ["@storm-stack/core"],
//         override: {
//           treeShaking: false
//         },
//         compiler: {
//           babel: {
//             plugins: [ModuleResolverPlugin(context)]
//           }
//         }
//       });
//       if (!command) {
//         throw new Error(`Module not found: ${entry.input.file}`);
//       }

//       const commandReflection = ReflectionFunction.from(command);
//       if (!commandReflection) {
//         throw new Error(`Reflection not found: ${entry.input.file}`);
//       }

//       const name = findCommandName(entry);
//       payloadReflections[entry.output] = CommandPayload.from(context, {
//         entry,
//         name,
//         title: titleCase(name),
//         type: commandReflection
//       });
//     }
//   }

//   return payloadReflections;
// }

// type CommandReflectionDefinition = Omit<
//   Command,
//   "parent" | "children" | "root"
// > & {
//   payload: CommandPayload;
//   relations: CommandRelations;
// };

// async function reflectCommand(
//   log: LogFn,
//   context: CLIPluginContext
// ): Promise<Record<string, CommandReflectionDefinition>> {
//   const relationsReflections = await reflectRelations(context);
//   const payloadsReflections = await reflectPayloads(context);

//   const reflections = {} as Record<string, CommandReflectionDefinition>;

//   for (const entry of context.entry.filter(
//     entry => entry.input.file !== context.options.entry
//   )) {
//     if (!entry.output) {
//       throw new Error(
//         `The entry "${entry.input.file}" does not have an output defined. Please ensure the entry has a valid output path.`
//       );
//     }

//     if (!relationsReflections[entry.output]) {
//       throw new Error(
//         `Unable to determine relation reflections for command "${entry.output}".`
//       );
//     }

//     const command = await Command.from(
//       context,
//       entry,
//       relationsReflections[entry.output]!
//     );

//     if (entry.isVirtual) {
//       const name = findCommandName(entry);

//       const command = {
//         id: entry.output,
//         type: new ReflectionFunction({
//           kind: ReflectionKind.function,
//           name: "handler",
//           description: entry.description,
//           parameters: [],
//           return: {
//             kind: ReflectionKind.any
//           }
//         }),
//         title: entry.title || titleCase(name),
//         name: entry.output,
//         entry,
//         payload: payloadsReflections[entry.output]!,
//         relations: relationsReflections[entry.output]!
//       };

//       command.type.parameters.push(
//         new ReflectionParameter(
//           {
//             kind: ReflectionKind.parameter,
//             name: "payload",
//             parent: command.type.type,
//             type: payloadsReflections[entry.output]!.type.type,
//             description: `The payload for the ${titleCase(name)} command.`,
//             tags: {
//               title: `Payload for ${titleCase(name)} command`
//             }
//           },
//           command.type
//         )
//       );

//       reflections[entry.output] = command;
//     } else {
//       log(
//         LogLevelLabel.TRACE,
//         `Precompiling the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
//       );

//       // eslint-disable-next-line ts/no-unsafe-function-type
//       const command = await resolveType<Function>(context, entry.input, {
//         skipNodeModulesBundle: true,
//         noExternal: context.options.noExternal,
//         external: ["@storm-stack/core"]
//       });
//       if (!command) {
//         throw new Error(`Module not found: ${entry.input.file}`);
//       }

//       const commandReflection = ReflectionFunction.from(command);
//       if (!commandReflection) {
//         throw new Error(`Reflection not found: ${entry.input.file}`);
//       }

//       const id = entry.output;
//       const name = findCommandName(entry);

//       reflections[id] = {
//         id,
//         name,
//         type: commandReflection,
//         title: titleCase(name),
//         entry,
//         payload: payloadsReflections[id]!,
//         relations: relationsReflections[id]!
//       };
//     }
//   }

//   await writeConfigTypeReflection(
//     context,
//     context.reflections.config.types.params,
//     "params"
//   );

//   return reflections;
// }

export function findCommandName(entry: ResolvedEntryTypeDefinition) {
  let name = findFolderName(entry.file);
  let count = 1;

  while (name.startsWith("[") && name.endsWith("]")) {
    name = findFolderName(resolveParentPath(entry.file, count++));
  }

  return name;
}

async function reflectRelations(
  context: CLIPluginContext
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

export async function reflectCommandTree(
  log: LogFn,
  context: CLIPluginContext
): Promise<CommandTree> {
  const relationsReflections = await reflectRelations(context);

  const reflections = {} as Record<string, Command>;
  await Promise.all(
    context.entry
      .filter(entry => entry.input.file !== context.options.entry)
      .map(async entry => {
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

        reflections[entry.output] = await Command.from(
          context,
          entry,
          relationsReflections[entry.output]!
        );
      })
  );

  const name = getAppName(context);
  const tree = {
    name,
    title: getAppTitle(context),
    bin: context.options.plugins.cli.bin
      ? Array.isArray(context.options.plugins.cli.bin)
        ? context.options.plugins.cli.bin
        : [context.options.plugins.cli.bin]
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
    command: Command
  ): CommandTreeBranch => {
    let commandTreeBranch = findCommandInTree(tree, command.path) as
      | CommandTreeBranch
      | undefined;

    if (!commandTreeBranch) {
      if (command.path.length === 1) {
        commandTreeBranch = {
          command,
          parent: tree,
          children: {},
          root: tree
        };
        tree.children[command.name] = commandTreeBranch;
      } else {
        let parent: CommandTreeBranch | CommandTree = tree;
        if (command.relations.parent) {
          const parentReflection = reflections[command.relations.parent];
          if (!parentReflection) {
            throw new Error(
              `Reflection not found for "${
                command.relations.parent
              }" in the ${command.id} command's parent tree.`
            );
          }

          parent = addCommand(tree, parentReflection);
        }

        if (parent.parent !== null) {
          command.title = `${parent.command.title} - ${command.title}`;
        }

        commandTreeBranch = {
          command,
          parent,
          children: {},
          root: tree
        };
        parent.children[commandTreeBranch.command.name] = commandTreeBranch;
      }
    }

    return commandTreeBranch;
  };

  for (const commandId of Object.keys(reflections)
    .filter(commandId => reflections[commandId])
    .sort((a, b) => b.localeCompare(a))) {
    addCommand(tree, reflections[commandId]!);
  }

  await writeConfigTypeReflection(
    context,
    context.reflections.config.types.params,
    "params"
  );

  return tree;
}
