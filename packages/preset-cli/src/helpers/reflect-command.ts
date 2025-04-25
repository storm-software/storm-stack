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
  resolveClassType,
  stringifyType
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { resolveType } from "@storm-stack/core/helpers/deepkit/reflect-type";
import { getReflectionsPath } from "@storm-stack/core/helpers/deepkit/resolve-reflections";
import { writeFile } from "@storm-stack/core/helpers/utilities/write-file";
import type { LogFn } from "@storm-stack/core/types";
import type {
  Context,
  Options,
  ResolvedEntryTypeDefinition
} from "@storm-stack/core/types/build";
import { StormJSON } from "@stryke/json/storm-json";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  findFolderName
} from "@stryke/path/file-path-fns";
import { resolveParentPath } from "@stryke/path/get-parent-path";
import { isRelativePath } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { loadFile } from "magicast";
import type { CommandReflection } from "../types/reflection";

export async function reflectCommands<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  commandEntries: ResolvedEntryTypeDefinition[]
): Promise<Record<string, CommandReflection>> {
  // const compiler = new CompilerContext();

  const reflections = {} as Record<string, CommandReflection>;
  for (const entry of commandEntries.sort((a, b) =>
    a.file.localeCompare(b.file)
  )) {
    log(
      LogLevelLabel.TRACE,
      `Precompiling the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
    );

    const entryModule = await loadFile(entry.input.file);
    if (!entryModule) {
      throw new Error(`Failure loading module AST: ${entry.input.file}`);
    }

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
          const dataReflection = resolveClassType(
            parameterReflection.getProperty("data").getType()
          );

          await writeFile(
            log,
            joinPaths(
              context.projectRoot,
              context.artifactsDir,
              "reflections",
              entry.file
                .replace(
                  joinPaths(context.projectRoot, context.artifactsDir),
                  ""
                )
                .replace(findFileName(entry.file), ""),
              `${findFileName(entry.file).replace(findFileExtension(entry.file), "")}-data.json`
            ),
            StormJSON.stringify(parameterReflection.serializeType())
          );

          let name = findFileName(entry.file).replace(
            findFileExtension(entry.file),
            ""
          );
          if (name === "index") {
            name = findFolderName(entry.file);
          }

          const argsTypeName = dataReflection.getName();
          let argsTypeImport = entryModule.imports[argsTypeName]?.from;
          if (!argsTypeImport) {
            throw new Error(
              `Cannot find import for ${argsTypeName} in ${entry.input.file}`
            );
          }

          if (isRelativePath(argsTypeImport)) {
            argsTypeImport = joinPaths(
              findFilePath(entry.input.file),
              argsTypeImport
            );
          }

          const reflection = {
            name,
            displayName: titleCase(name),
            description: commandReflection.description,
            entry,
            argsTypeName,
            argsTypeImport,
            args: dataReflection.getProperties().map(property => {
              const argName = property.getNameAsString();
              const argAlias = kebabCase(argName);

              let type = stringifyType(property.getType());
              let options = undefined as string[] | number[] | undefined;
              if (type.includes("|")) {
                options = type
                  .split("|")
                  .map(option =>
                    option.trim().replaceAll('"', "").replaceAll("'", "")
                  );
                type = "enum";
              }

              return {
                name: argName,
                displayName: titleCase(argName),
                type,
                options,
                description: property.getDescription(),
                alias: argAlias !== argName ? [argAlias] : [],
                required:
                  !property.isOptional() &&
                  property.getDefaultValue() === undefined,
                default: property.getDefaultValue()
              };
            })
          } as CommandReflection;

          const parentCommand = findFolderName(
            resolveParentPath(findFilePath(entry.file))
          );
          if (parentCommand && reflections[parentCommand]) {
            reflection.displayName = `${titleCase(parentCommand)} - ${reflection.displayName}`;

            reflections[parentCommand].subCommands ??= {};
            reflections[parentCommand].subCommands[name] = reflection;
          } else {
            reflections[name] = reflection;
          }
        }
      }
    }
  }

  await writeFile(
    log,
    joinPaths(getReflectionsPath(context), "cli.json"),
    StormJSON.stringify(reflections)
  );

  return reflections;
}
