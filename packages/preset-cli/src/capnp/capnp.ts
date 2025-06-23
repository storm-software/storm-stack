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
  deserializeType,
  ReflectionClass,
  ReflectionFunction,
  ReflectionKind,
  serializeType
} from "@deepkit/type";
import {
  convertFromCapnp as convertFromCapnpSerializedTypes,
  convertToCapnp as convertToCapnpSerializedTypes
} from "@storm-stack/core/helpers/utilities/capnp";
import { Context, Options } from "@storm-stack/core/types/build";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import {
  Command as CapnpCommand,
  CommandEntryTypeDefinition as CapnpCommandEntryTypeDefinition,
  CommandPayload as CapnpCommandPayload,
  CommandRoot as CapnpCommandRoot
} from "../../schemas/cli";
import { CommandPayload } from "../data/command-payload";
import {
  findCommandInTree,
  flattenCommandTree,
  getAppName,
  getAppTitle
} from "../helpers/utilities";
import { StormStackCLIPresetConfig } from "../types/config";
import {
  Command,
  CommandEntryTypeDefinition,
  CommandTree
} from "../types/reflection";

function convertToCapnpCommandEntryTypeDefinition(
  commandEntry: CommandEntryTypeDefinition,
  result: CapnpCommandEntryTypeDefinition
): CapnpCommandEntryTypeDefinition {
  if (!commandEntry) {
    throw new Error("Invalid command entry provided for conversion.");
  }

  result.title = commandEntry.title || "";
  result.description = commandEntry.description || "";
  result.file = commandEntry.file;
  result.output = commandEntry.output;
  result.isVirtual = commandEntry.isVirtual;

  const input = result._initInput();
  input.file = commandEntry.input.file;
  input.name = commandEntry.input.name || "";

  const path = result._initPath(commandEntry.path.length);
  commandEntry.path.forEach((p, i) => {
    if (isSetString(p)) {
      path.set(i, p);
    }
  });

  return result;
}

function convertToCapnpCommandPayload(
  commandPayload: CommandPayload,
  result: CapnpCommandPayload
): CapnpCommandPayload {
  if (!commandPayload) {
    throw new Error("Invalid command payload provided for conversion.");
  }

  if (commandPayload.import) {
    result.import = result._initImport();
    result.import.file = commandPayload.import.file || "";
    result.import.name = commandPayload.import.name || "";
  }

  const serializeTypes = commandPayload.type.serializeType();
  const types = result._initType(serializeTypes.length);
  convertToCapnpSerializedTypes(serializeTypes, types);

  const args = result._initArgs(commandPayload.args.length);
  for (let i = 0; i < commandPayload.args.length; i++) {
    const arg = commandPayload.args[i]!;

    const capnpArg = args.get(i);
    capnpArg.name = arg.type.getNameAsString() || "";
    capnpArg.isNegativeOf = arg.isNegativeOf || "";
    capnpArg.skipNegative = arg.skipNegative ?? false;
  }

  return result;
}

function convertToCapnpCommand(
  command: Command,
  result: CapnpCommand
): CapnpCommand {
  if (!command) {
    throw new Error(
      "Invalid command tree child command provided for conversion."
    );
  }

  result.id = command.id;
  result.name = command.name;
  result.title = command.title;
  result.parent = command.parent.parent !== null ? command.parent.id : "";

  const serializeTypes = serializeType(command.type.type);
  result.type = convertToCapnpSerializedTypes(
    serializeTypes,
    result._initType(serializeTypes.length)
  );

  result.entry = convertToCapnpCommandEntryTypeDefinition(
    command.entry,
    result._initEntry()
  );

  result.payload = convertToCapnpCommandPayload(
    command.payload,
    result._initPayload()
  );

  const children = result._initChildren(Object.values(command.children).length);
  Object.values(command.children).forEach((child, i) => {
    children.set(i, child.id);
  });

  return result;
}

function convertFromCapnpCommandEntryTypeDefinition(
  entry: CapnpCommandEntryTypeDefinition
): CommandEntryTypeDefinition {
  if (!entry) {
    throw new Error(
      "Invalid Cap'n Proto command entry provided for conversion."
    );
  }

  return {
    file: entry.file,
    input: {
      file: entry.input.file,
      name: entry.input.name
    },
    output: entry.output,
    path: entry._hasPath() ? entry.path.map(p => p) : [],
    isVirtual: entry.isVirtual
  };
}

function convertFromCapnpCommand(
  root: CapnpCommandRoot,
  config: StormStackCLIPresetConfig,
  tree: CommandTree,
  command: CapnpCommand
): Omit<Command, "parent"> {
  if (!command) {
    throw new Error("Invalid Cap'n Proto command provided for conversion.");
  }

  let type!: ReflectionFunction;
  if (command._hasType()) {
    const deserializedType = deserializeType(
      convertFromCapnpSerializedTypes(command.type)
    );
    if (
      deserializedType &&
      (deserializedType.kind === ReflectionKind.method ||
        deserializedType.kind === ReflectionKind.methodSignature ||
        deserializedType.kind === ReflectionKind.function)
    ) {
      type = new ReflectionFunction(deserializedType);
    }
  }

  const entry = convertFromCapnpCommandEntryTypeDefinition(command.entry);
  if (!type) {
    type = new ReflectionFunction({
      kind: ReflectionKind.function,
      name: `handle${pascalCase(command.id)}Command`,
      description: entry.description,
      parameters: [],
      return: {
        kind: ReflectionKind.any
      },
      tags: {
        title: entry.title || command.title,
        domain: "cli"
      }
    });
  }

  const result: Omit<Command, "parent"> = {
    id: command.id,
    name: command.name,
    title: entry.title || command.title,
    type,
    payload: {} as CommandPayload,
    entry,
    children: {},
    root: tree
  };

  if (command._hasPayload()) {
    let reflection: ReflectionClass<any> | undefined;
    if (command.payload._hasType()) {
      const payloadType = deserializeType(
        convertFromCapnpSerializedTypes(command.payload.type)
      );
      if (
        payloadType &&
        (payloadType.kind === ReflectionKind.class ||
          payloadType.kind === ReflectionKind.objectLiteral)
      ) {
        reflection = ReflectionClass.from(payloadType);
      }
    }

    result.payload = CommandPayload.from(config, result, reflection);
    if (command.payload._hasImport()) {
      result.payload.import = {
        file: command.payload.import.file || "",
        name: command.payload.import.name || ""
      };
    }

    command.payload.args.forEach(arg => {
      result.payload.add({
        name: arg.name,
        isNegativeOf: arg.isNegativeOf ? arg.isNegativeOf : undefined,
        skipNegative: arg.skipNegative || false
      });
    });
  }

  if (command._hasChildren()) {
    command.children.forEach(child => {
      const childCommand = convertFromCapnpCommand(
        root,
        config,
        tree,
        root.commands.find(comm => comm.id === child)!
      );
      result.children[childCommand.name] = {
        ...childCommand,
        parent: result as Command
      };
    });
  }

  return result;
}

/**
 * Converts a CLI {@link CommandTree} tree to Cap'n Proto serialized command tree.
 *
 * @param commandTree - The {@link CommandTree} object defined in a [Storm Stack](https://stormsoftware.com/) project
 * @param result - The [Cap'n Proto](https://capnproto.org/) {@link CapnpCommandTree | command tree} to convert the CLI command tree to
 * @returns The [Cap'n Proto](https://capnproto.org/) {@link CapnpCommandTree | command tree} converted from the CLI command tree
 * @throws If the provided command tree is invalid or cannot be converted
 */
export function convertToCapnp(
  commandTree: CommandTree,
  result: CapnpCommandRoot
): CapnpCommandRoot {
  if (!commandTree) {
    throw new Error("Invalid command tree provided for conversion.");
  }

  result.entry = convertToCapnpCommandEntryTypeDefinition(
    commandTree.entry,
    result._initEntry()
  );

  const commands = flattenCommandTree(commandTree);
  const capnpCommands = result._initCommands(commands.length);

  commands.forEach((cmd, i) => {
    capnpCommands.set(i, convertToCapnpCommand(cmd, capnpCommands.get(i)));
  });

  return result;
}

function addChildCommand(
  tree: CommandTree,
  root: CapnpCommandRoot,
  commands: Command[],
  command: Command
): Command {
  if (!tree || !command) {
    throw new Error("Invalid command tree or result provided for conversion.");
  }

  const existing = findCommandInTree(tree, command.entry.path) as
    | Command
    | undefined;
  if (existing) {
    return existing;
  }

  const capnpCommand = root.commands.find(c => c.id === command.id);
  if (!capnpCommand) {
    throw new Error(
      `Cap'n Proto command with ID ${command.id} not found in the persisted Cap'n Proto command tree. It is likely that running the "prepare" command again will resolve this issue.`
    );
  }

  if (command.entry.path.length === 1) {
    tree.children[command.name] = command;
  } else {
    let parent = findCommandInTree(
      tree,
      command.entry.path
        .filter(part => !part.startsWith("[") && !part.endsWith("]"))
        .slice(0, -1)
    ) as Command | undefined;

    if (!commands.some(c => c.id === capnpCommand.parent)) {
      throw new Error(
        `Parent command not found for command: ${command.name} with path: ${command.entry.path.join(
          "/"
        )}. Ensure that the parent command exists in the command tree.

The following commands were saved to the persisted file:
${root.commands.map(c => `- ${c.name} (${c.entry.path.join("/")})`).join("\n")}

The following commands were read from the Cap'n Proto command tree buffer:
${commands.map(c => `- ${c.entry.path.join("/")}`).join("\n")}
`
      );
    }

    parent ??= addChildCommand(
      tree,
      root,
      commands,
      commands.find(c => c.id === capnpCommand.parent)!
    );

    parent.children[command.name] = command;
  }

  return command;
}

/**
 * Converts a Cap'n Proto serialized command root to a CLI {@link CommandTree} object.
 *
 * @param context - The build context containing workspace and package information
 * @param config - The StormStackCLIPresetConfig containing configuration options for the CLI
 * @param root - The Cap'n Proto serialized command tree root object
 * @returns The CLI {@link CommandTree} object converted from the Cap'n Proto serialized command tree
 * @throws If the provided command root is invalid or cannot be converted
 */
export function convertFromCapnp<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig,
  root: CapnpCommandRoot
): CommandTree {
  if (!root) {
    throw new Error("Invalid command root provided for conversion.");
  }

  const name = getAppName(context, config);
  const result: CommandTree = {
    name,
    title: getAppTitle(context, config),
    bin: config.bin
      ? Array.isArray(config.bin)
        ? config.bin
        : [config.bin]
      : [name],
    description:
      context.options.description || context.packageJson?.description,
    entry: convertFromCapnpCommandEntryTypeDefinition(root.entry),
    parent: null,
    children: {}
  };

  if (root._hasCommands()) {
    const commands = [] as Command[];
    root.commands.forEach(command => {
      const childCommand = convertFromCapnpCommand(
        root,
        config,
        result,
        command
      );
      commands.push({
        ...childCommand,
        parent: result,
        root: result
      });
    });

    commands
      .filter(childCommand => childCommand.entry.path.length > 0)
      .forEach(childCommand => {
        addChildCommand(result, root, commands, childCommand);
      });
  }

  return result;
}
