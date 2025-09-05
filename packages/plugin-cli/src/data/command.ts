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
  ReflectionParameter,
  Type
} from "@storm-stack/core/deepkit/type";
import { resolveType } from "@storm-stack/core/lib/deepkit/reflect-type";
import { titleCase } from "@stryke/string-format/title-case";
import { TypeDefinition } from "@stryke/types/configuration";
import { writeCommandReflection } from "../helpers/persistence";
import { findCommandName } from "../helpers/reflect-command";
import { getAppTitle, reflectRequestBaseType } from "../helpers/utilities";
import { CLIPluginContext } from "../types/config";
import {
  CommandEntryTypeDefinition,
  CommandRelations
} from "../types/reflection";
import { CommandRequest } from "./command-request";

/**
 * A wrapper class for command requests in a CLI application.
 *
 * @remarks
 * This class is used to define the structure of command requests, including their arguments and types.
 */
export class Command {
  /**
   * Creates a new Command instance.
   *
   * @param context - The CLI plugin context.
   * @param entry - The command entry definition.
   * @param relations - The relations of the command, including parent and children commands.
   * @param reflection - The reflection metadata for the command.
   * @returns A new Command instance.
   */
  public static async from(
    context: CLIPluginContext,
    entry: CommandEntryTypeDefinition,
    relations: CommandRelations,
    // eslint-disable-next-line ts/no-unsafe-function-type
    reflection?: ReflectionClass<any> | ReflectionFunction | Function
  ): Promise<Command> {
    const name = findCommandName(entry);
    const title = entry.title || titleCase(name);

    let type!: ReflectionClass<any>;

    context.reflections.cli ??= {};
    if (context.reflections.cli[entry.output]) {
      type = context.reflections.cli[entry.output]!;
    } else if (
      (reflection as ReflectionClass<any>)?.type?.kind &&
      ((reflection as ReflectionClass<any>)?.type?.kind ===
        ReflectionKind.class ||
        (reflection as ReflectionClass<any>)?.type?.kind ===
          ReflectionKind.objectLiteral)
    ) {
      type = ReflectionClass.from(reflection as ReflectionClass<any>);
      if (!type) {
        throw new Error(`Reflection not found: ${entry.input.file}`);
      }

      if (!type.hasProperty("request")) {
        throw new Error(
          `Request property not found in command type: ${entry.input.file}`
        );
      }
    } else {
      let commandReflection!: ReflectionFunction;
      if (!reflection) {
        if (entry.isVirtual) {
          const requestBaseType = await reflectRequestBaseType(context);

          commandReflection = new ReflectionFunction({
            kind: ReflectionKind.function,
            parameters: [],
            return: { kind: ReflectionKind.void },
            name,
            tags: {
              title,
              domain: "cli"
            }
          });

          const parameter = new ReflectionParameter(
            {
              kind: ReflectionKind.parameter,
              name: "request",
              parent: commandReflection.type,
              description: `The request data required by the ${
                title
              } command to execute.`,
              type: requestBaseType.type,
              tags: {
                title: `${title} Command Request`,
                domain: "cli"
              }
            },
            commandReflection
          );

          commandReflection.parameters.push(parameter);
        } else {
          // const command = await resolveType<Function>(context, entry.input, {
          //   outputPath: context.options.workspaceRoot,
          //   skipNodeModulesBundle: true,
          //   noExternal: context.options.noExternal,
          //   external: ["@storm-stack/core"],
          //   override: {
          //     treeShaking: false
          //   },
          //   compiler: {
          //     babel: {
          //       plugins: [ModuleResolverPlugin(context)]
          //     }
          //   }
          // });

          // eslint-disable-next-line ts/no-unsafe-function-type
          const command = await resolveType<Function>(context, entry.input, {
            skipNodeModulesBundle: true,
            noExternal: context.options.noExternal,
            external: ["@storm-stack/core"]
          });
          if (!command) {
            throw new Error(`Module not found: ${entry.input.file}`);
          }

          if (!command) {
            throw new Error(`Module not found: ${entry.input.file}`);
          }

          commandReflection = ReflectionFunction.from(command);
          if (!commandReflection) {
            throw new Error(`Reflection not found: ${entry.input.file}`);
          }
        }
      } else {
        commandReflection = reflection as ReflectionFunction;
        if (!commandReflection?.type?.kind) {
          // eslint-disable-next-line ts/no-unsafe-function-type
          commandReflection = ReflectionFunction.from(reflection as Function);
        }
      }

      if (
        !commandReflection ||
        commandReflection.type.kind !== ReflectionKind.function
      ) {
        throw new Error(`Invalid command reflection type: ${entry.input.file}`);
      }

      const request = CommandRequest.from(context, entry, commandReflection);

      type = new ReflectionClass({
        kind: ReflectionKind.objectLiteral,
        description: commandReflection.getDescription(),
        types: [],
        tags: {
          title,
          domain: "cli"
        }
      });
      type.addProperty({
        name: "request",
        description: `The request data required by the ${
          title
        } command to execute.`,
        type: request.type.type,
        tags: {
          title: `${title} Command Request`,
          domain: "cli"
        }
      });

      if (
        commandReflection.getReturnType().kind === ReflectionKind.class ||
        commandReflection.getReturnType().kind === ReflectionKind.objectLiteral
      ) {
        const resultReflection = ReflectionClass.from(
          commandReflection.getReturnType()
        );

        type.addProperty({
          name: "result",
          description:
            resultReflection.getDescription() ||
            `The result data returned back after execution of the ${
              title
            } command is complete.`,
          type: resultReflection.type
        });
      } else {
        type.addProperty({
          name: "result",
          description: `The result data returned back after execution of the ${
            title
          } command is complete.`,
          type: commandReflection.getReturnType()
        });
      }
    }

    if (!type) {
      throw new Error(
        `Unable to determined the reflection data for the ${
          title
        } command (file: ${entry.input.file})`
      );
    }

    const result = new Command(context, entry, relations, type);
    await writeCommandReflection(context, result.type, entry.output);

    return result;
  }

  #overrideTitle: string | undefined;

  #type: ReflectionClass<{
    request: ReflectionClass<any>;
    result: ReflectionClass<any>;
  }>;

  #relations: CommandRelations;

  public get id(): string {
    return this.entry.output;
  }

  public get name(): string {
    return findCommandName(this.entry);
  }

  public get file(): string {
    return this.entry.file;
  }

  public get isVirtual(): boolean {
    return this.entry.isVirtual;
  }

  public get input(): TypeDefinition {
    return this.entry.input;
  }

  public get title(): string {
    return this.entry.title || titleCase(this.#overrideTitle || this.name);
  }

  public set title(value: string) {
    this.#overrideTitle = value;
  }

  public get description(): string {
    let description = this.entry.description;
    if (!description) {
      if (this.isVirtual) {
        description = `The ${this.title} set of commands used by the ${getAppTitle(
          this.context
        )} application.`;
      } else {
        description =
          this.type.getDescription() ||
          `The ${this.title} command of the ${titleCase(
            getAppTitle(this.context)
          )} CLI application.`;
      }
    }

    return !description.endsWith(".") && !description.endsWith("?")
      ? `${description}.`
      : description;
  }

  public get path(): string[] {
    return this.entry.path;
  }

  public get relations(): CommandRelations {
    return this.#relations;
  }

  public get type(): ReflectionClass<{
    request: ReflectionClass<any>;
    result: ReflectionClass<any>;
  }> {
    return this.#type;
  }

  /**
   * The request data structure for the command.
   */
  public get request(): CommandRequest {
    return CommandRequest.from(
      this.context,
      this.entry,
      ReflectionClass.from(this.type.getProperty("request").getType())
    );
  }

  /**
   * The result data structure for the command.
   */
  public get result(): Type {
    return this.type.getProperty("result").getType();
  }

  private constructor(
    protected context: CLIPluginContext,
    protected entry: CommandEntryTypeDefinition,
    relations: CommandRelations,
    type: ReflectionClass<{
      request: ReflectionClass<any>;
      result: ReflectionClass<any>;
    }>
  ) {
    this.#type = type;
    this.#relations = relations;
  }
}
