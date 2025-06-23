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
  ReflectionClass,
  ReflectionFunction,
  ReflectionKind,
  resolveClassType,
  Type
} from "@deepkit/type";
import { OrganizationConfig } from "@storm-software/config/types";
import { reflectType } from "@storm-stack/core/helpers/deepkit/reflect-type";
import { joinPaths } from "@stryke/path/index";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { TypeDefinition } from "@stryke/types/configuration";
import defu from "defu";
import { CommandPayloadArg } from "../data/command-payload";
import { StormStackCLIPluginContext } from "../types/build";
import { StormStackCLIPluginConfig } from "../types/config";
import { Command, CommandTree } from "../types/reflection";

/**
 * Sorts command argument aliases, placing single-character aliases first, followed by multi-character aliases, and then sorting them alphabetically.
 *
 * @param aliases - An array of argument aliases to sort.
 * @returns A new array of sorted aliases.
 */
export function sortArgAliases(aliases: string[]): string[] {
  if (aliases.length === 0) {
    return [];
  }

  const result = aliases.filter(alias => alias.length === 1);
  result.push(...aliases.filter(alias => alias.length > 1));

  return result.sort((a, b) => a.localeCompare(b));
}

export function sortArgs(
  args: CommandPayloadArg[] | readonly CommandPayloadArg[]
): CommandPayloadArg[] {
  if (!args || args.length === 0) {
    return [];
  }

  return args
    .filter(arg => !arg.isNegativeOf)
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((ret, arg) => {
      ret.push(arg);

      // Add the negative argument if it exists
      const negativeArg = args.find(a => a.isNegativeOf === arg.name);
      if (negativeArg) {
        ret.push(negativeArg);
      }

      return ret;
    }, [] as CommandPayloadArg[]);
}

/**
 * Checks if the provided Node.js version is one of the valid minimum versions (16, 18, 20, 22).
 *
 * @param version - The Node.js version to check.
 * @returns An indicator of whether the version is valid.
 */
export function isValidMinNodeVersion(
  version: number
): version is 16 | 18 | 20 | 22 {
  return [16, 18, 20, 22].includes(version);
}

/**
 * Extracts the author information from the context and configuration.
 *
 * @param context - The build context containing workspace and package information.
 * @param config - The StormStackCLIPluginConfig containing author information.
 * @returns An OrganizationConfig object with the author's name.
 */
export function extractAuthor(
  context: StormStackCLIPluginContext,
  config: StormStackCLIPluginConfig = {}
): OrganizationConfig | undefined {
  let author: OrganizationConfig | undefined;
  if (config.author) {
    if (isString(config.author)) {
      author = { name: config.author };
    } else if (isObject(config.author)) {
      author = config.author;
    }
  }

  if (context.workspaceConfig.organization) {
    if (isString(context.workspaceConfig.organization) && !author?.name) {
      author ??= {} as OrganizationConfig;
      author.name = context.workspaceConfig.organization;
    } else {
      author = defu(author ?? {}, context.workspaceConfig.organization);
    }
  }

  if (!author?.name) {
    if (context.packageJson?.author) {
      author ??= {} as OrganizationConfig;
      author.name = isString(context.packageJson.author)
        ? context.packageJson.author
        : context.packageJson.author?.name;
    } else if (
      context.packageJson?.contributors &&
      context.packageJson.contributors.length > 0 &&
      context.packageJson.contributors[0] &&
      (isSetString(context.packageJson.contributors[0]) ||
        isSetString(context.packageJson.contributors[0].name))
    ) {
      author ??= {} as OrganizationConfig;
      author.name = (
        isString(context.packageJson.contributors[0])
          ? context.packageJson.contributors[0]
          : context.packageJson.contributors[0].name
      )!;
    }
  }

  if (author?.name) {
    author.name = kebabCase(author.name);
  }

  return author;
}

/**
 * Retrieves the application name from the context and configuration.
 *
 * @param context - The build context containing workspace and package information.
 * @param config - The StormStackCLIPluginConfig containing binary name options.
 * @returns The application name in kebab-case format.
 * @throws An error if no valid application name is found.
 */
export function getAppName(
  context: StormStackCLIPluginContext,
  config: StormStackCLIPluginConfig = {}
): string {
  const result =
    config.bin &&
    (isSetString(config.bin) ||
      (Array.isArray(config.bin) && config.bin.length > 0 && config.bin[0]))
      ? isSetString(config.bin)
        ? config.bin
        : config.bin[0]
      : context.options.name || context.packageJson?.name;
  if (!isSetString(result)) {
    throw new Error(
      "No application name found. Please provide a 'bin' option in the configuration or ensure the package.json has a valid 'name' field."
    );
  }

  return kebabCase(result);
}

/**
 * Retrieves the application title from the context and configuration.
 *
 * @param context - The build context containing workspace and package information.
 * @param config - The StormStackCLIPluginConfig containing binary name options.
 * @returns The application title in title-case format.
 */
export function getAppTitle(
  context: StormStackCLIPluginContext,
  config: StormStackCLIPluginConfig = {}
): string {
  return titleCase(context.options.name || getAppName(context, config));
}

/**
 * Extracts the command payload type from a given method or function type.
 *
 * @param type - The Type to extract the command payload from.
 * @returns A ReflectionClass representing the command payload type.
 * @throws An error if the provided type is invalid or does not conform to the expected structure.
 */
export function extractCommandPayload(type: Type): ReflectionClass<any> {
  if (
    !type ||
    (type.kind !== ReflectionKind.method &&
      type.kind !== ReflectionKind.methodSignature &&
      type.kind !== ReflectionKind.function)
  ) {
    throw new Error(
      `Invalid command type provided for conversion to buffer message. ${JSON.stringify(
        type
      )}`
    );
  }

  const functionType = new ReflectionFunction(type);
  if (
    functionType.getParameters().length === 0 ||
    !functionType.getParameters()[0]
  ) {
    throw new Error(
      "Command methods must have at least one parameter defined for the payload."
    );
  }

  return extractCommandFunctionPayload(functionType);
}

/**
 * Extracts the command payload type from a given ReflectionFunction.
 *
 * @param type - The ReflectionFunction to extract the command payload from.
 * @returns A ReflectionClass representing the command payload type.
 * @throws An error if the provided function does not have a valid payload structure.
 */
export function extractCommandFunctionPayload(
  type: ReflectionFunction
): ReflectionClass<any> {
  if (type.getParameters().length === 0 || !type.getParameters()[0]) {
    throw new Error(
      "Command methods must have at least one parameter defined for the payload."
    );
  }

  const param = type.getParameters()[0]!;

  return extractCommandFunctionPayloadData(param.getType());
}

/**
 * Extracts the command payload type from a given ReflectionFunction.
 *
 * @param payloadType - The ReflectionFunction to extract the command payload from.
 * @returns A ReflectionClass representing the command payload type.
 * @throws An error if the provided function does not have a valid payload structure.
 */
export function extractCommandFunctionPayloadData(
  payloadType: Type | ReflectionClass<any>
): ReflectionClass<any> {
  const payload = ReflectionClass.from(payloadType);
  if (!payload || !payload.hasProperty("data")) {
    throw new Error(
      `Command method payloads must be of type 'StormPayload'. ${
        !payload
          ? "No payload type provided."
          : `Provided payload is the incorrect type: ${payload.getClassName()}`
      }.`
    );
  }

  const payloadDataType = payload.getProperty("data").getType();
  if (
    !payloadDataType ||
    (payloadDataType.kind !== ReflectionKind.objectLiteral &&
      payloadDataType.kind !== ReflectionKind.class &&
      payloadDataType.kind !== ReflectionKind.object)
  ) {
    throw new Error(
      `Command method payloads must be of type 'StormPayload', received: ${
        payloadDataType.typeName || payloadDataType.kind
      }.`
    );
  }

  if (payloadDataType.kind === ReflectionKind.object) {
    return new ReflectionClass({
      kind: ReflectionKind.objectLiteral,
      description: "Command payload data",
      types: []
    });
  }

  return ReflectionClass.from(payloadDataType);
}

export function getPayloadBaseTypeDefinition(
  context: StormStackCLIPluginContext
): TypeDefinition {
  return {
    file: joinPaths(context.runtimePath, "payload.ts"),
    name: "StormPayload"
  };
}

export async function reflectPayloadBaseType(
  context: StormStackCLIPluginContext
): Promise<ReflectionClass<any>> {
  const defaultPayloadType = await reflectType(
    context,
    getPayloadBaseTypeDefinition(context),
    {
      skipDotenvTransform: true
    }
  );

  const payloadType = resolveClassType(defaultPayloadType);
  if (!payloadType || !payloadType.hasProperty("data")) {
    throw new Error(
      "The command method's first argument must have a type of \`StormPayload\`. The type representing the application's command-line arguments should be provided as the type parameter."
    );
  }

  return payloadType;
}

export function findCommandInTree(
  tree: CommandTree | Command,
  path: string[]
): CommandTree | Command | undefined {
  if (path.length === 0) {
    return tree;
  } else if (path.length === 1) {
    return tree.children[path[0]!];
  } else {
    const child = tree.children[path[0]!];
    if (child) {
      return findCommandInTree(child, path.slice(1));
    }
  }

  return undefined;
}

export function flattenCommandTree(tree: CommandTree | Command): Command[] {
  let commands: Command[] = [];
  Object.values(tree.children).forEach(child => {
    if (!commands.some(cmd => cmd.id === child.id)) {
      commands.push(child);
    }

    commands = flattenCommandTree(child).reduce((ret, cmd) => {
      if (!ret.some(existingCmd => existingCmd.id === cmd.id)) {
        ret.push(cmd);
      }
      return ret;
    }, commands);
  });

  return commands;
}
