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
import { joinPaths } from "@stryke/path/join-paths";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";

export function getConfigReflectionsPath(
  context: Context,
  name: "values" | "secrets"
): string {
  return joinPaths(getReflectionsPath(context), `config-${name}.bin`);
}

export async function readConfigReflection(
  context: Context,
  name: "values" | "secrets" = "values"
): Promise<ReflectionClass<any>> {
  const result = await readFile(getConfigReflectionsPath(context, name));
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
  name: "values" | "secrets" = "values"
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
