/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { ReflectionProperty, SerializedTypes } from "@deepkit/type";
import {
  ReflectionClass,
  ReflectionKind,
  resolveClassType
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { readJsonFile } from "@stryke/fs/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import type { TypeDefinition } from "@stryke/types/configuration";
import { deserializeType } from "node_modules/@deepkit/type/dist/cjs/src/type-serialization";
import type {
  Context,
  Options,
  ResolvedDotenvOptions,
  ResolvedDotenvType
} from "../../types/build";
import type { LogFn } from "../../types/config";
import { getReflectionsPath } from "../deepkit/resolve-reflections";
import { writeFile } from "../utilities/write-file";

export function getDotenvDefaultTypeDefinition<
  TOptions extends Options = Options
>(context: Context<TOptions>): TypeDefinition {
  return {
    file: process.env.STORM_STACK_LOCAL
      ? joinPaths(
          context.workspaceConfig.workspaceRoot,
          "dist/packages/types/dist/esm/src/env.js"
        )
      : "@storm-stack/types/env",
    name: "__ΩStormEnvVariables"
  };
}

export function getDotenvReflectionsPath<TOptions extends Options = Options>(
  context: Context<TOptions>,
  name: "variables" | "secrets"
): string {
  return joinPaths(getReflectionsPath(context), `${name}.json`);
}

export function getDotenvPath<TOptions extends Options = Options>(
  context: Context<TOptions>,
  name: "variables" | "secrets"
): string {
  return joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.projectRoot,
    context.artifactsDir,
    "dotenv",
    `${name}.json`
  );
}

export async function resolveDotenvProperties<
  TOptions extends Options = Options
>(
  log: LogFn,
  context: Context<TOptions>,
  name: "variables" | "secrets"
): Promise<ReflectionProperty[]> {
  const varsFilePath = getDotenvPath(context, name);

  const reflection = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the dotenv variables used by the ${context.name ? `${context.name} application` : "application"}.`,
    types: []
  });

  try {
    if (existsSync(varsFilePath)) {
      return resolveClassType(
        deserializeType(await readJsonFile<SerializedTypes>(varsFilePath))
      ).getProperties();
    }
  } catch (e) {
    log(
      LogLevelLabel.ERROR,
      `Failed to read the dotenv properties from "${varsFilePath}". Error: ${e}`
    );
  }

  await writeFile(
    log,
    varsFilePath,
    StormJSON.stringify(reflection.serializeType())
  );

  return [] as ReflectionProperty[];
}

export async function resolveDotenvReflection<
  TOptions extends Options = Options
>(
  context: Context<TOptions>,
  name: "variables" | "secrets"
): Promise<ReflectionClass<any>> {
  if (context.resolvedDotenv?.types?.[name]?.reflection) {
    return context.resolvedDotenv?.types?.[name]?.reflection;
  }

  const varsFilePath = getDotenvReflectionsPath(context, name);
  if (existsSync(varsFilePath)) {
    const varsType = deserializeType(
      await readJsonFile<SerializedTypes>(varsFilePath)
    );
    if (varsType) {
      const reflection = resolveClassType(varsType);

      context.resolvedDotenv ??= {} as ResolvedDotenvOptions;
      context.resolvedDotenv.types ??= {
        variables: {} as ResolvedDotenvType<ReflectionClass<any>>
      };
      context.resolvedDotenv.types[name] = {
        reflection
      };

      return reflection;
    }
  } else {
    throw new Error(
      `The dotenv reflection file "${varsFilePath}" does not exist. Please run the "prepare" command to generate the dotenv reflection file.`
    );
  }

  throw new Error(
    "The dotenv reflection could not be determined. Please run the " +
      '"prepare" command to generate the dotenv reflection file.'
  );
}
