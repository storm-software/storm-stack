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
  ReflectionKind,
  ReflectionProperty,
  ReflectionVisibility,
  stringifyType,
  TagsReflection,
  Type
} from "@deepkit/type";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { titleCase } from "@stryke/string-format/title-case";
import { TypeDefinition } from "@stryke/types/configuration";
import defu from "defu";
import {
  extractCommandFunctionPayload,
  extractCommandFunctionPayloadData
} from "../helpers/utilities";
import { StormStackCLIPresetConfig } from "../types/config";
import { Command, CommandEntryTypeDefinition } from "../types/reflection";

export interface CommandPayloadArg {
  name: string;
  title: string;
  type: ReflectionProperty;
  options: string[];
  isNegativeOf?: string;
  skipNegative?: boolean;
}

export interface AddCommandPayloadArgProps extends TagsReflection {
  name: string;
  default?: any;
  optional?: boolean;
  readonly?: true | undefined;
  description?: string | undefined;
  visibility?: ReflectionVisibility | undefined;
  type?: Type;
  tags?: TagsReflection;
  isNegativeOf?: string;
  skipNegative?: boolean;
}

function getDefaultCommandPayloadArgs(
  config: StormStackCLIPresetConfig,
  entry: CommandEntryTypeDefinition
): AddCommandPayloadArgProps[] {
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
      config.interactive !== "never" &&
      config.interactive !== true && {
        name: "interactive",
        title: "Interactive",
        description:
          "Enable interactive mode (will be set to false if running in a CI pipeline).",
        alias: ["i", "interact"],
        type: { kind: ReflectionKind.boolean },
        optional: true,
        default: config.interactive !== false
      },
    !entry.isVirtual &&
      config.interactive !== "never" &&
      config.interactive !== false && {
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
      alias: [],
      type: { kind: ReflectionKind.boolean },
      optional: true,
      default: false,
      isNegativeOf: "banner"
    },
    !entry.isVirtual && {
      name: "verbose",
      title: "Verbose",
      description: "Enable verbose output.",
      alias: ["v"],
      type: { kind: ReflectionKind.boolean },
      optional: true,
      default: false,
      skipNegative: true
    }
  ].filter(Boolean) as AddCommandPayloadArgProps[];
}

/**
 * A wrapper class for command payloads in a CLI application.
 *
 * @remarks
 * This class is used to define the structure of command payloads, including their arguments and types.
 */
export class CommandPayload {
  /**
   * Creates a new CommandPayload instance.
   *
   * @param config - The configuration for the Storm Stack CLI preset.
   * @param command - The command that this payload is associated with.
   * @throws An error if the command type is invalid or does not conform to the expected structure.
   */
  public static from(
    config: StormStackCLIPresetConfig,
    command: Pick<Command, "name" | "title" | "entry"> &
      Partial<Pick<Command, "type">>,
    reflection?: ReflectionClass<any>
  ): CommandPayload {
    let type = new ReflectionClass({
      kind: ReflectionKind.objectLiteral,
      description: `The payload data types for the ${
        command.title || titleCase(command.name)
      } CLI command.`,
      types: []
    });
    if (reflection) {
      if (
        reflection.getClassName() === "StormPayload" &&
        reflection.hasProperty("data")
      ) {
        type = extractCommandFunctionPayloadData(reflection);
      } else {
        type = reflection;
      }
    } else if (command.type) {
      type = extractCommandFunctionPayload(command.type);
    }

    const result = new CommandPayload(command, type);

    const defaultArgs = getDefaultCommandPayloadArgs(config, command.entry);

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

    return result;
  }

  /**
   * The arguments for the command payload.
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
   * The import path for the payload type, if it is defined in a separate file.
   *
   * @remarks
   * If not defined, the payload type is defined in the same file as the command.
   */
  public import?: TypeDefinition;

  /**
   * The list of arguments for the command payload.
   */
  public get args(): readonly CommandPayloadArg[] {
    return (
      this.#args.map(arg => {
        let type!: ReflectionProperty;
        if (this.type.hasProperty(arg.name)) {
          type = this.type.getProperty(arg.name);
        } else {
          const title = titleCase(arg.name);
          type = this.type.addProperty({
            name: arg.name,
            description: `The ${title} command-line option for the ${
              this.command.title || titleCase(this.command.name)
            } command.`,
            type: {
              kind: ReflectionKind.string
            },
            optional: true,
            tags: {
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
    protected command: Pick<Command, "name" | "title" | "entry"> &
      Partial<Pick<Command, "type">>,
    public type: ReflectionClass<any>
  ) {
    this.#args = [];
    this.type = type;
  }

  /**
   * Adds a new argument to the command payload.
   *
   * @param arg - The properties of the argument to add.
   * @throws An error if an argument with the same name already exists in the command payload.
   */
  public add = (arg: AddCommandPayloadArgProps) => {
    if (!this.find(arg.name)) {
      if (
        arg.type?.kind === ReflectionKind.boolean &&
        !arg.isNegativeOf &&
        !arg.skipNegative
      ) {
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
      }

      this.#args.push({
        name: arg.name,
        isNegativeOf: arg.isNegativeOf,
        skipNegative: !!(arg.isNegativeOf || arg.skipNegative)
      });

      if (!this.type.hasProperty(arg.name)) {
        const title = arg.title ? arg.title : titleCase(arg.name);
        const type: Type = arg.type ?? {
          kind: ReflectionKind.string
        };

        if (arg.isNegativeOf) {
          type.kind = ReflectionKind.boolean;
        }

        this.type.addProperty({
          description: `The ${title} command-line option for the ${
            this.command.title || titleCase(this.command.name)
          } command.`,
          ...arg,
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
    }
  };

  /**
   * Finds an argument in the command payload by its name.
   *
   * @param name - The name of the argument to find.
   * @returns The CommandPayloadArg if found, otherwise undefined.
   */
  public find = (name: string): CommandPayloadArg | undefined => {
    return this.args.find(
      arg =>
        this.areNamesEqual(arg, name) ||
        arg.type.getAlias().some(alias => this.areNamesEqual(arg, alias))
    );
  };

  private areNamesEqual = (arg: CommandPayloadArg, name: string): boolean => {
    const argName = arg.type.getNameAsString();

    return (
      argName.toLowerCase() === name.toLowerCase() ||
      kebabCase(argName) === name.toLowerCase() ||
      kebabCase(argName) === kebabCase(name) ||
      argName.toLowerCase() === pascalCase(name)
    );
  };
}
