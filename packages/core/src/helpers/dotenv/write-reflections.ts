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
import { getDotenvReflectionsPath, getVarsReflectionsPath } from "./resolve";

export async function writeDotenvReflection<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  reflection: ReflectionClass<any>,
  name: "variables" | "secrets"
) {
  let reflectionObject = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the dotenv variables used by the ${context.options.name ? `${context.options.name} application` : "application"}.`,
    types: []
  });

  const varsFilePath = getDotenvReflectionsPath(context, name);
  if (existsSync(varsFilePath)) {
    reflectionObject = resolveClassType(
      deserializeType(await readJsonFile<SerializedTypes>(varsFilePath))
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
  name: "variables" | "secrets",
  properties: ReflectionProperty[]
) {
  const varsFilePath = getVarsReflectionsPath(context, name);

  let reflectionObjectLiteral = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the dotenv variables used by the ${context.options.name ? `${context.options.name} application` : "application"}.`,
    types: []
  });
  if (existsSync(varsFilePath)) {
    reflectionObjectLiteral = resolveClassType(
      deserializeType(await readJsonFile<SerializedTypes>(varsFilePath))
    );
  }

  properties.map(prop => {
    if (!reflectionObjectLiteral.hasProperty(prop.getName())) {
      reflectionObjectLiteral.addProperty(prop.property);
    }
  });

  await writeFile(
    log,
    varsFilePath,
    StormJSON.stringify(reflectionObjectLiteral.serializeType())
  );
}
