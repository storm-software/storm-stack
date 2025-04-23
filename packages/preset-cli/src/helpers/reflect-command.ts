/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import {
  ReflectionClass,
  ReflectionFunction,
  ReflectionKind,
  stringifyType
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { resolveType } from "@storm-stack/core/helpers/deepkit/reflect-type";
import { getReflectionsPath } from "@storm-stack/core/helpers/deepkit/resolve-reflections";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { LogFn } from "@storm-stack/core/types";
import type { Context, Options } from "@storm-stack/core/types/build";
import { StormJSON } from "@stryke/json/storm-json";
import { joinPaths } from "@stryke/path/join-paths";
import type { StormStackCLIPresetConfig } from "../types/config";

export async function reflectCommands<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  _config: StormStackCLIPresetConfig
): Promise<ReflectionFunction[]> {
  // const compiler = new CompilerContext();

  const reflections = [] as ReflectionFunction[];
  const metadata = {} as Record<string, any>;
  for (const entry of context.resolvedEntry) {
    log(
      LogLevelLabel.TRACE,
      `Precompiling the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
    );

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
      const parameter = parameters[0];
      if (
        parameter &&
        (parameter.type.kind === ReflectionKind.class ||
          parameter.type.kind === ReflectionKind.objectLiteral)
      ) {
        const parameterReflection = ReflectionClass.from(parameter.type);
        if (parameterReflection.hasProperty("data")) {
          await writeFile(
            log,
            joinPaths(
              getReflectionsPath(context),
              `${entry.input.file
                .replace(context.projectRoot, "")
                .replace(/\.ts$/, "")}-data.json`
            ),
            StormJSON.stringify(parameterReflection.serializeType())
          );

          reflections.push(commandReflection);
          metadata[entry.input.file] = {
            name: commandReflection.name,
            description: commandReflection.description,
            parameters: parameterReflection.getProperties().map(prop => {
              return {
                name: prop.getNameAsString(),
                description: prop.getDescription(),
                type: stringifyType(prop.getType()),
                isOptional: prop.isActualOptional(),
                default: prop.getDefaultValue()
              };
            })
          };
        }
      }
    }
  }

  await writeFile(
    log,
    joinPaths(getReflectionsPath(context), "cli.json"),
    StormJSON.stringify(metadata)
  );

  return reflections;
}
