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
  deserializeType,
  ReflectionClass,
  resolveClassType
} from "@deepkit/type";
import * as capnp from "@stryke/capnp";
import { readBufferFile, writeBufferFile } from "@stryke/fs/buffer";
import { joinPaths } from "@stryke/path/join-paths";
import type { TypeDefinition } from "@stryke/types/configuration";
import { SerializedTypes } from "../../../schemas/reflection";
import type { Context } from "../../types/build";
import { getReflectionsPath } from "../deepkit/resolve-reflections";
import { convertFromCapnp, convertToCapnp } from "../utilities/capnp";

export function getDotenvDefaultTypeDefinition(
  context: Context
): TypeDefinition {
  return {
    file: process.env.STORM_STACK_LOCAL
      ? joinPaths(
          context.workspaceConfig.workspaceRoot,
          "dist/packages/types/dist/esm/src/shared/config.js"
        )
      : "@storm-stack/types/config",
    name: "__ΩStormBaseConfig"
  };
}

export function getDotenvReflectionsPath(
  context: Context,
  name: "config" | "secrets" = "config"
): string {
  return joinPaths(getReflectionsPath(context), `dotenv-${name}.bin`);
}

export function getConfigReflectionsPath(
  context: Context,
  name: "config" | "secrets"
): string {
  return joinPaths(getReflectionsPath(context), `${name}.bin`);
}

export async function readDotenvReflection(
  context: Context,
  name: "config" | "secrets" = "config"
): Promise<ReflectionClass<any>> {
  const buffer = await readBufferFile(getDotenvReflectionsPath(context, name));
  const message = new capnp.Message(buffer, false);

  const reflection = resolveClassType(
    deserializeType(convertFromCapnp(message.getRoot(SerializedTypes).types))
  );
  context.dotenv.types[name]!.reflection = reflection;

  return reflection;
}

export async function writeDotenvReflection(
  context: Context,
  reflection: ReflectionClass<any>,
  name: "config" | "secrets" = "config"
) {
  const serialized = reflection.serializeType();

  const message = new capnp.Message();
  const root = message.initRoot(SerializedTypes);

  convertToCapnp(serialized, root._initTypes(serialized.length));

  await writeBufferFile(
    getDotenvReflectionsPath(context, name),
    message.toArrayBuffer()
  );
}

export async function readConfigReflection(
  context: Context
): Promise<ReflectionClass<any>> {
  const buffer = await readBufferFile(
    getDotenvReflectionsPath(context, "config")
  );
  const message = new capnp.Message(buffer, false);

  return resolveClassType(
    deserializeType(convertFromCapnp(message.getRoot(SerializedTypes).types))
  );
}
