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

import {
  ReflectionClass,
  ReflectionFunction,
  ReflectionKind,
  resolveClassType,
  Type
} from "@deepkit/type";
import { OrganizationConfig } from "@storm-software/config/types";
import { reflectType } from "@storm-stack/core/lib/deepkit/reflect-type";
import { joinPaths } from "@stryke/path/index";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { TypeDefinition } from "@stryke/types/configuration";
import defu from "defu";
import { CommandRequestArg } from "../data/command-request";
import { CLIPluginContext, CLIPluginOptions } from "../types/config";
import { CommandTree, CommandTreeBranch } from "../types/reflection";

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
  args: CommandRequestArg[] | readonly CommandRequestArg[]
): CommandRequestArg[] {
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
    }, [] as CommandRequestArg[]);
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
 * @returns An OrganizationConfig object with the author's name.
 */
export function extractAuthor(
  context: CLIPluginContext
): OrganizationConfig | undefined {
  let author: OrganizationConfig | undefined;
  if (context.options.plugins.cli.author) {
    if (isString(context.options.plugins.cli.author)) {
      author = { name: context.options.plugins.cli.author };
    } else if (isObject(context.options.plugins.cli.author)) {
      author = context.options.plugins.cli.author;
    }
  }

  if (context.options.organization) {
    if (isString(context.options.organization) && !author?.name) {
      author ??= {} as OrganizationConfig;
      author.name = context.options.organization;
    } else {
      author = defu(author ?? {}, context.options.organization);
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
  context: CLIPluginContext,
  config: CLIPluginOptions = {}
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
  context: CLIPluginContext,
  config: CLIPluginOptions = {}
): string {
  return titleCase(context.options.name || getAppName(context, config));
}

/**
 * Extracts the command request type from a given method or function type.
 *
 * @param type - The Type to extract the command request from.
 * @returns A ReflectionClass representing the command request type.
 * @throws An error if the provided type is invalid or does not conform to the expected structure.
 */
export function extractCommandRequest(type: Type): ReflectionClass<any> {
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
      "Command methods must have at least one parameter defined for the request."
    );
  }

  return extractCommandFunctionRequest(functionType);
}

/**
 * Extracts the command request type from a given ReflectionFunction.
 *
 * @param type - The ReflectionFunction to extract the command request from.
 * @returns A ReflectionClass representing the command request type.
 * @throws An error if the provided function does not have a valid request structure.
 */
export function extractCommandFunctionRequest(
  type: ReflectionFunction
): ReflectionClass<any> {
  if (type.getParameters().length === 0 || !type.getParameters()[0]) {
    throw new Error(
      "Command methods must have at least one parameter defined for the request."
    );
  }

  const param = type.getParameters()[0]!;

  return extractCommandFunctionRequestData(param.getType());
}

/**
 * Extracts the command request type from a given ReflectionFunction.
 *
 * @param requestType - The ReflectionFunction to extract the command request from.
 * @returns A ReflectionClass representing the command request type.
 * @throws An error if the provided function does not have a valid request structure.
 */
export function extractCommandFunctionRequestData(
  requestType: Type | ReflectionClass<any>
): ReflectionClass<any> {
  const request = ReflectionClass.from(requestType);
  if (!request || !request.hasProperty("data")) {
    throw new Error(
      `Command method requests must be of type 'StormRequest'. ${
        !request
          ? "No request type provided."
          : `Provided request is the incorrect type: '${request.getName()}'.`
      }.`
    );
  }

  const requestDataType = request.getProperty("data").getType();
  if (
    !requestDataType ||
    (requestDataType.kind !== ReflectionKind.objectLiteral &&
      requestDataType.kind !== ReflectionKind.class &&
      requestDataType.kind !== ReflectionKind.object &&
      requestDataType.kind !== ReflectionKind.any)
  ) {
    throw new Error(
      `Command method requests must be of type 'StormRequest', received: ${
        requestDataType.typeName || requestDataType.kind
      }.`
    );
  }

  if (requestDataType.kind === ReflectionKind.object) {
    return new ReflectionClass({
      kind: ReflectionKind.objectLiteral,
      description: "Command request data",
      types: []
    });
  }

  return ReflectionClass.from(requestDataType);
}

export function getRequestBaseTypeDefinition(
  context: CLIPluginContext
): TypeDefinition {
  return {
    file: joinPaths(context.runtimePath, "request.ts"),
    name: "StormRequest"
  };
}

export async function reflectRequestBaseType(
  context: CLIPluginContext
): Promise<ReflectionClass<any>> {
  const defaultRequestType = await reflectType(
    context,
    getRequestBaseTypeDefinition(context),
    {
      skipNodeModulesBundle: true,
      noExternal: context.options.noExternal,
      external: ["@storm-stack/core"]
    }
  );

  const requestType = resolveClassType(defaultRequestType);
  if (!requestType || !requestType.hasProperty("data")) {
    throw new Error(
      "The command method's first argument must have a type of \`StormRequest\`. The type representing the application's command-line arguments should be provided as the type parameter."
    );
  }

  return requestType;
}

export function findCommandInTree(
  tree: CommandTree | CommandTreeBranch,
  path: string[]
): CommandTree | CommandTreeBranch | undefined {
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

export function flattenCommandTree(
  tree: CommandTree | CommandTreeBranch
): CommandTreeBranch[] {
  let commands: CommandTreeBranch[] = [];
  Object.values(tree.children).forEach(child => {
    if (!commands.some(cmd => cmd.command.id === child.command.id)) {
      commands.push(child);
    }

    commands = flattenCommandTree(child).reduce((ret, cmd) => {
      if (!ret.some(existingCmd => existingCmd.command.id === cmd.command.id)) {
        ret.push(cmd);
      }
      return ret;
    }, commands);
  });

  return commands;
}
