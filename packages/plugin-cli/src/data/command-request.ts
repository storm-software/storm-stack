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
  ReflectionProperty,
  ReflectionVisibility,
  stringifyType,
  TagsReflection,
  Type
} from "@storm-stack/core/deepkit";
import { camelCase } from "@stryke/string-format/camel-case";
import { constantCase } from "@stryke/string-format/constant-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isUndefined } from "@stryke/type-checks/is-undefined";
import { TypeDefinition } from "@stryke/types/configuration";
import defu from "defu";
import { findCommandName } from "../helpers/reflect-command";
import {
  extractCommandFunctionRequest,
  extractCommandFunctionRequestData
} from "../helpers/utilities";
import { CLIPluginContext, CLIPluginOptions } from "../types/config";
import { CommandEntryTypeDefinition } from "../types/reflection";

export interface CommandRequestArg {
  name: string;
  title: string;
  type: ReflectionProperty;
  options: string[];
  isNegativeOf?: string;
  skipNegative?: boolean;
}

export interface AddCommandRequestArgProps extends TagsReflection {
  name: string;
  default?: any;
  optional?: boolean;
  readonly?: true;
  description?: string;
  visibility?: ReflectionVisibility;
  type?: Type;
  tags?: TagsReflection;
  isNegativeOf?: string;
  skipNegative?: boolean;
}

function getDefaultCommandRequestArgs(
  options: CLIPluginOptions,
  entry: CommandEntryTypeDefinition
): AddCommandRequestArgProps[] {
  return [
    {
      name: "help",
      title: "Help",
      description: "Show help information.",
      alias: ["h", "?"],
      type: { kind: ReflectionKind.boolean },
      optional: true,
      default: false,
      skipNegative: true
    },
    {
      name: "version",
      title: "Version",
      description: "Show the version of the application.",
      alias: ["v"],
      type: { kind: ReflectionKind.boolean },
      optional: true,
      default: false,
      skipNegative: true
    },
    !entry.isVirtual &&
      options.interactive !== "never" &&
      options.interactive !== true && {
        name: "interactive",
        title: "Interactive",
        description:
          "Enable interactive mode (will be set to false if running in a CI pipeline).",
        alias: ["i", "interact"],
        type: { kind: ReflectionKind.boolean },
        optional: true,
        default: options.interactive !== false
      },
    !entry.isVirtual &&
      options.interactive !== "never" &&
      options.interactive !== false && {
        name: "no-interactive",
        title: "Non-Interactive",
        description:
          "Disable interactive mode (will be set to true if running in a CI pipeline).",
        alias: ["no-interact"],
        type: { kind: ReflectionKind.boolean },
        optional: true,
        default: false,
        isNegativeOf: "interactive"
      },
    {
      name: "no-banner",
      title: "Hide Banner",
      description:
        "Hide the banner displayed while running the CLI application (will be set to true if running in a CI pipeline).",
      type: { kind: ReflectionKind.boolean },
      optional: true,
      default: false,
      isNegativeOf: "banner"
    },
    !entry.isVirtual && {
      name: "verbose",
      title: "Verbose",
      description: "Enable verbose output.",
      type: { kind: ReflectionKind.boolean },
      optional: true,
      default: false,
      skipNegative: true
    }
  ].filter(Boolean) as AddCommandRequestArgProps[];
}

/**
 * A wrapper class for command requests in a CLI application.
 *
 * @remarks
 * This class is used to define the structure of command requests, including their arguments and types.
 */
export class CommandRequest {
  /**
   * Creates a new CommandRequest instance.
   *
   * @param context - The CLI plugin context.
   * @param entry - The command entry definition.
   * @param reflection - The reflection information for the command.
   * @returns A new CommandRequest instance.
   * @throws An error if the command type is invalid or does not conform to the expected structure.
   */
  public static from(
    context: CLIPluginContext,
    entry: CommandEntryTypeDefinition,
    // eslint-disable-next-line ts/no-unsafe-function-type
    reflection: ReflectionClass<any> | ReflectionFunction | Function
  ): CommandRequest {
    try {
      const name = findCommandName(entry);
      const title = entry.title || titleCase(name);

      let type = new ReflectionClass({
        kind: ReflectionKind.objectLiteral,
        description: `The request data types for the ${title} CLI command.`,
        types: []
      });

      if (
        (reflection as ReflectionClass<any>)?.type?.kind &&
        ((reflection as ReflectionClass<any>)?.type?.kind ===
          ReflectionKind.class ||
          (reflection as ReflectionClass<any>)?.type?.kind ===
            ReflectionKind.objectLiteral)
      ) {
        const reflectionClass = ReflectionClass.from(
          reflection as ReflectionClass<any>
        );
        if (!reflectionClass) {
          throw new Error(`Reflection not found: ${entry.input.file}`);
        }

        if (
          reflectionClass.getClassName() === "StormRequest" &&
          reflectionClass.hasProperty("data")
        ) {
          type = extractCommandFunctionRequestData(reflectionClass);
        } else if (reflectionClass.hasProperty("request")) {
          const requestType = reflectionClass.getProperty("request").getType();
          if (
            requestType.kind !== ReflectionKind.class &&
            requestType.kind !== ReflectionKind.objectLiteral
          ) {
            throw new Error(
              `Request for ${title} must be of type objectLiteral or class, instead received: ${requestType.kind}`
            );
          }

          type = ReflectionClass.from(requestType);
        } else {
          type = reflectionClass;
        }
      } else {
        let commandReflection = reflection as ReflectionFunction;
        if (!(reflection as ReflectionFunction)?.type?.kind) {
          // eslint-disable-next-line ts/no-unsafe-function-type
          commandReflection = ReflectionFunction.from(reflection as Function);
        }

        if (!commandReflection) {
          throw new Error(`Reflection not found: ${entry.input.file}`);
        }

        type = extractCommandFunctionRequest(commandReflection);
      }

      const result = new CommandRequest(context, entry, type);

      const defaultArgs = getDefaultCommandRequestArgs(
        context.options.plugins.cli,
        entry
      );

      type.getProperties().forEach(arg => {
        const matchingDefaultArg = defaultArgs.find(
          defaultArg => defaultArg.name === arg.getNameAsString()
        );

        result.add(
          defu(
            {
              ...arg,
              name: arg.getNameAsString(),
              default: arg.getDefaultValue(),
              optional: arg.isOptional(),
              readonly: arg.isReadonly() ? true : undefined,
              description: arg.getDescription(),
              visibility: arg.getVisibility(),
              type: arg.getType(),
              alias: arg.getAlias(),
              domain: arg.getDomain() || "cli",
              title: arg.getTitle() || titleCase(arg.getNameAsString()),
              permission: arg.getPermission(),
              hidden: arg.isHidden(),
              ignore: arg.isIgnored(),
              internal: arg.isInternal(),
              tags: arg.getTags()
            },
            matchingDefaultArg ?? {}
          )
        );
      });

      defaultArgs
        .filter(arg => !result.find(arg.name))
        .forEach(arg => {
          result.add(arg);
        });

      result.type
        .getProperties()
        .filter(
          prop =>
            prop.getNameAsString() &&
            prop.getNameAsString().toLowerCase() !== "argv" &&
            prop.getNameAsString().toLowerCase() !== "help" &&
            prop.getNameAsString().toLowerCase() !== "version" &&
            !prop.isIgnored() &&
            !context.reflections.config.types.params.hasProperty(
              constantCase(prop.getNameAsString())
            )
        )
        .forEach(prop => {
          context.reflections.config.types.params.addProperty({
            ...prop,
            name: constantCase(prop.getNameAsString()),
            default:
              prop.getKind() === ReflectionKind.string && prop.getDefaultValue()
                ? String(prop.getDefaultValue())
                    .replaceAll('"', "")
                    .replaceAll("'", "")
                : prop.getDefaultValue()
          });
        });

      return result;
    } catch (error) {
      throw new Error(
        `Failed to create CommandRequest for ${entry.input.file}: ${error.message}`
      );
    }
  }

  /**
   * The arguments for the command request.
   *
   * @remarks
   * Each argument is represented as an object with a name and a command Id indicating if it is negative.
   */
  #args: Array<{
    name: string;
    isNegativeOf?: string;
    skipNegative?: boolean;
  }> = [];

  /**
   * The import path for the request type, if it is defined in a separate file.
   *
   * @remarks
   * If not defined, the request type is defined in the same file as the command.
   */
  public import?: TypeDefinition;

  /**
   * The list of arguments for the command request.
   */
  public get args(): readonly CommandRequestArg[] {
    return (
      this.#args
        .filter(arg => arg.name)
        .map(arg => {
          let type!: ReflectionProperty;
          if (this.type.hasProperty(camelCase(arg.name))) {
            type = this.type.getProperty(camelCase(arg.name));
          } else {
            const title = titleCase(arg.name);
            type = this.type.addProperty({
              name: arg.name,
              description: `The ${title} command-line option for the ${
                this.entry.title || titleCase(this.entry.name)
              } command.`,
              type: {
                kind: ReflectionKind.string
              },
              optional: true,
              tags: {
                domain: "cli",
                title
              }
            });
          }

          const stringifiedType = stringifyType(type.getType());

          let options = [] as string[];
          if (stringifiedType.includes("|")) {
            options = stringifiedType
              .split("|")
              .map(option =>
                option.trim().replaceAll('"', "").replaceAll("'", "")
              );
          }

          return {
            name: kebabCase(arg.name),
            title: type.getTitle() || titleCase(arg.name),
            type,
            options,
            isNegativeOf: arg.isNegativeOf,
            skipNegative: arg.skipNegative
          };
        }) ?? []
    );
  }

  private constructor(
    protected context: CLIPluginContext,
    protected entry: CommandEntryTypeDefinition,
    public type: ReflectionClass<any>
  ) {
    this.#args = [];
    this.type = type;
  }

  /**
   * Adds a new argument to the command request.
   *
   * @param arg - The properties of the argument to add.
   * @throws An error if an argument with the same name already exists in the command request.
   */
  public add = (arg: AddCommandRequestArgProps) => {
    if (arg.name && !this.find(arg.name)) {
      if (arg.type?.kind === ReflectionKind.boolean && !arg.skipNegative) {
        if (!arg.isNegativeOf) {
          const inverseName = `no-${kebabCase(arg.name)}`;
          if (!this.args.some(a => a.name === inverseName)) {
            this.add({
              name: inverseName,
              title: titleCase(inverseName),
              description: `The inverse of the ${arg.name} option.`,
              default: false,
              optional: true,
              isNegativeOf: arg.name,
              skipNegative: true
            });
          }
        } else if (arg.isNegativeOf) {
          this.add({
            name: arg.isNegativeOf,
            title: titleCase(arg.isNegativeOf),
            description: `The inverse of the ${arg.name} option.`,
            default: !isUndefined(arg.default) ? !arg.default : undefined,
            optional: true,
            isNegativeOf: arg.name,
            skipNegative: true
          });
        }
      }

      this.#args.push({
        name: kebabCase(arg.name),
        isNegativeOf: arg.isNegativeOf,
        skipNegative: Boolean(arg.isNegativeOf || arg.skipNegative)
      });

      if (!this.type.hasProperty(camelCase(arg.name))) {
        const title = arg.title ? arg.title : titleCase(arg.name);
        const type: Type = arg.type ?? {
          kind: ReflectionKind.string
        };

        if (arg.isNegativeOf) {
          type.kind = ReflectionKind.boolean;
        }

        this.type.addProperty({
          description: `The ${title} command-line option for the ${
            this.entry.title || titleCase(this.entry.name)
          } command.`,
          ...arg,
          name: camelCase(arg.name),
          optional: arg.optional !== false ? true : undefined,
          type,
          tags: {
            ...arg.tags,
            hidden: arg.hidden,
            ignore: arg.ignore,
            internal: arg.internal,
            alias: arg.alias,
            readonly: arg.readonly,
            permission: arg.permission,
            domain: "cli",
            title
          }
        });
      }

      if (
        !this.context.reflections.config.types.params.hasProperty(
          constantCase(arg.name)
        )
      ) {
        const title = arg.title ? arg.title : titleCase(arg.name);
        const type: Type = arg.type ?? {
          kind: ReflectionKind.string
        };

        if (arg.isNegativeOf) {
          type.kind = ReflectionKind.boolean;
        }

        if (!arg.ignore) {
          this.context.reflections.config.types.params.addProperty({
            ...arg,
            optional: arg.optional !== false ? true : undefined,
            name: constantCase(arg.name),
            type,
            tags: {
              ...arg.tags,
              hidden: arg.hidden,
              internal: arg.internal,
              alias: arg.alias,
              readonly: arg.readonly,
              permission: arg.permission,
              domain: "cli",
              title
            }
          });
        }
      }
    }
  };

  /**
   * Finds an argument in the command request by its name.
   *
   * @param name - The name of the argument to find.
   * @returns The CommandRequestArg if found, otherwise undefined.
   */
  public find = (name: string): CommandRequestArg | undefined => {
    return this.args.find(
      arg =>
        this.areNamesEqual(arg, name) ||
        arg.type.getAlias().some(alias => this.areNamesEqual(arg, alias))
    );
  };

  private areNamesEqual = (arg: CommandRequestArg, name: string): boolean => {
    const argName = arg.type.getNameAsString();

    return (
      argName.toLowerCase() === name.toLowerCase() ||
      kebabCase(argName) === name.toLowerCase() ||
      kebabCase(argName) === kebabCase(name) ||
      argName.toLowerCase() === pascalCase(name)
    );
  };
}
