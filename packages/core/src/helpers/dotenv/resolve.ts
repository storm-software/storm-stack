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
          "dist/packages/types/dist/esm/src/shared/vars.js"
        )
      : "@storm-stack/types/vars",
    name: "__ΩStormBaseVariables"
  };
}

export function getDotenvReflectionsPath<TOptions extends Options = Options>(
  context: Context<TOptions>,
  name: "config" | "secrets"
): string {
  return joinPaths(getReflectionsPath(context), "dotenv", `${name}.json`);
}

export function getConfigReflectionsPath<TOptions extends Options = Options>(
  context: Context<TOptions>,
  name: "config" | "secrets"
): string {
  return joinPaths(getReflectionsPath(context), `${name}.json`);
}

export async function resolveDotenvProperties<
  TOptions extends Options = Options
>(
  log: LogFn,
  context: Context<TOptions>,
  name: "config" | "secrets"
): Promise<ReflectionProperty[]> {
  const configFilePath = getConfigReflectionsPath(context, name);

  const reflection = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the dotenv variables used by the ${context.options.name ? `${context.options.name} application` : "application"}.`,
    types: []
  });

  try {
    if (existsSync(configFilePath)) {
      return resolveClassType(
        deserializeType(await readJsonFile<SerializedTypes>(configFilePath))
      ).getProperties();
    }
  } catch (e) {
    log(
      LogLevelLabel.ERROR,
      `Failed to read the dotenv properties from "${configFilePath}". Error: ${e}`
    );
  }

  await writeFile(
    log,
    configFilePath,
    StormJSON.stringify(reflection.serializeType())
  );

  return [] as ReflectionProperty[];
}

export async function resolveDotenvReflection<
  TOptions extends Options = Options
>(
  context: Context<TOptions>,
  name: "config" | "secrets",
  skipContext = false
): Promise<ReflectionClass<any>> {
  if (context.dotenv?.types?.[name]?.reflection && !skipContext) {
    return context.dotenv?.types?.[name]?.reflection;
  }

  const configFilePath = getDotenvReflectionsPath(context, name);
  if (existsSync(configFilePath)) {
    const configFileContent =
      await readJsonFile<SerializedTypes>(configFilePath);
    const configType = deserializeType(configFileContent);
    if (configType) {
      const reflection = resolveClassType(configType);

      context.dotenv ??= {} as ResolvedDotenvOptions;
      context.dotenv.types ??= {
        config: {} as ResolvedDotenvType<ReflectionClass<any>>
      };
      context.dotenv.types[name] = {
        reflection
      };

      return reflection;
    }
  } else {
    throw new Error(
      `The dotenv reflection file "${configFilePath}" does not exist. Please run the "prepare" command to generate the dotenv reflection file.`
    );
  }

  throw new Error(
    "The dotenv reflection could not be determined. Please run the " +
      '"prepare" command to generate the dotenv reflection file.'
  );
}
