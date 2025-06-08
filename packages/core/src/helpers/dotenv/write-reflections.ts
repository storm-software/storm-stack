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
  deserializeType,
  ReflectionClass,
  ReflectionKind,
  resolveClassType
} from "@deepkit/type";
import { readJsonFile } from "@stryke/fs/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import type { Context, Options } from "../../types/build";
import type { LogFn } from "../../types/config";
import { writeFile } from "../utilities/write-file";
import { getConfigReflectionsPath, getDotenvReflectionsPath } from "./resolve";

export async function writeDotenvReflection<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  reflection: ReflectionClass<any>,
  name: "config" | "secrets"
) {
  let reflectionObject = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the dotenv variables used by the ${context.options.name ? `${context.options.name} application` : "application"}.`,
    types: []
  });

  const configFilePath = getDotenvReflectionsPath(context, name);
  if (existsSync(configFilePath)) {
    reflectionObject = resolveClassType(
      deserializeType(await readJsonFile<SerializedTypes>(configFilePath))
    );
  }

  reflection.getProperties().map(prop => {
    if (!reflectionObject.hasProperty(prop.getName())) {
      reflectionObject.addProperty(prop.property);
    }
  });

  const serialized = reflectionObject.serializeType();

  return writeFile(
    log,
    getDotenvReflectionsPath(context, name),
    StormJSON.stringify(serialized)
  );
}

export async function writeDotenvProperties<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  name: "config" | "secrets",
  properties: ReflectionProperty[]
) {
  const configFilePath = getConfigReflectionsPath(context, name);

  let reflectionObjectLiteral = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the dotenv variables used by the ${context.options.name ? `${context.options.name} application` : "application"}.`,
    types: []
  });
  if (existsSync(configFilePath)) {
    reflectionObjectLiteral = resolveClassType(
      deserializeType(await readJsonFile<SerializedTypes>(configFilePath))
    );
  }

  properties.map(prop => {
    if (!reflectionObjectLiteral.hasProperty(prop.getName())) {
      reflectionObjectLiteral.addProperty(prop.property);
    }
  });

  await writeFile(
    log,
    configFilePath,
    StormJSON.stringify(reflectionObjectLiteral.serializeType())
  );
}
