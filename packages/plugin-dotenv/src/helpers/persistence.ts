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
  deserializeType,
  ReflectionClass,
  resolveClassType
} from "@deepkit/type";
import { convertFromCapnp, convertToCapnp } from "@storm-stack/core/lib/capnp";
import { getReflectionsPath } from "@storm-stack/core/lib/deepkit/resolve-reflections";
import { SerializedTypes } from "@storm-stack/core/schemas/reflection";
import { Context } from "@storm-stack/core/types/context";
import * as capnp from "@stryke/capnp";
import { readBufferFile } from "@stryke/fs/buffer";
import { joinPaths } from "@stryke/path/join-paths";
import type { TypeDefinition } from "@stryke/types/configuration";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";

export function getDotenvDefaultTypeDefinition(
  context: Context
): TypeDefinition {
  return {
    file: process.env.STORM_STACK_LOCAL
      ? joinPaths(
          context.options.workspaceConfig.workspaceRoot,
          "dist/packages/types/dist/esm/src/shared/dotenv.js"
        )
      : "@storm-stack/types/dotenv",
    name: "__ΩStormBaseConfig"
  };
}

export function getDotenvReflectionsPath(
  context: Context,
  name: "config" | "secrets" = "config"
): string {
  return joinPaths(getReflectionsPath(context), `${name}-vars.bin`);
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
  context.reflections[name] = reflection;

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

  await context.vfs.writeFile(
    getDotenvReflectionsPath(context, name),
    Buffer.from(message.toArrayBuffer()),
    {
      encoding: "binary",
      outputMode: "fs"
    }
  );
}

export async function readConfigReflection(
  context: Context,
  name: "config" | "secrets" = "config"
): Promise<ReflectionClass<any>> {
  const result = await readFile(getDotenvReflectionsPath(context, name));
  const buffer = result.buffer.slice(
    result.byteOffset,
    result.byteOffset + result.byteLength
  ) as ArrayBuffer;

  const message = new capnp.Message(buffer, false);

  return resolveClassType(
    deserializeType(convertFromCapnp(message.getRoot(SerializedTypes).types))
  );
}

export async function writeConfigReflection(
  context: Context,
  reflection: ReflectionClass<any>,
  name: "config" | "secrets" = "config"
) {
  const serialized = reflection.serializeType();

  const message = new capnp.Message();
  const root = message.initRoot(SerializedTypes);

  convertToCapnp(serialized, root._initTypes(serialized.length));

  await context.vfs.writeFile(
    getConfigReflectionsPath(context, name),
    Buffer.from(message.toArrayBuffer()),
    {
      encoding: "binary",
      outputMode: "fs"
    }
  );
}
