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

import { deserializeType, resolveClassType } from "@deepkit/type";
import { convertFromCapnp, convertToCapnp } from "@storm-stack/core/lib/capnp";
import { getReflectionsPath } from "@storm-stack/core/lib/deepkit/resolve-reflections";
import { SerializedTypes } from "@storm-stack/core/schemas/reflection";
import { Reflection, ReflectionRecord } from "@storm-stack/core/types/context";
import * as capnp from "@stryke/capnp";
import { readFileBuffer, writeFileBuffer } from "@stryke/fs/buffer";
import { listFiles } from "@stryke/fs/list-files";
import { joinPaths } from "@stryke/path/join-paths";
import { existsSync } from "node:fs";
import {
  CLICommandReflectionProperties,
  CLIPluginContext
} from "../types/config";

export function getCommandReflectionsPath(context: CLIPluginContext): string {
  return joinPaths(getReflectionsPath(context), "cli");
}

export function getCommandReflectionFilePath(
  context: CLIPluginContext,
  commandId: string
): string {
  return joinPaths(
    getCommandReflectionsPath(context),
    `command-${commandId}.bin`
  );
}

export async function readCommandReflection(
  context: CLIPluginContext,
  commandId: string
): Promise<Reflection<CLICommandReflectionProperties>> {
  const filePath = getCommandReflectionFilePath(context, commandId);
  if (!existsSync(filePath)) {
    throw new Error(`CLI Command reflection file ${filePath} not found`);
  }

  const buffer = await readFileBuffer(filePath);
  const message = new capnp.Message(buffer, false);
  const messageRoot = message.getRoot(SerializedTypes);

  const reflection = resolveClassType(
    deserializeType(convertFromCapnp(messageRoot.types))
  );

  context.reflections.cli[commandId] = reflection;
  context.reflections.cli[commandId].messageRoot = messageRoot;
  context.reflections.cli[commandId].dataBuffer = buffer;

  return reflection;
}

export async function writeCommandReflection(
  context: CLIPluginContext,
  reflection: Reflection<CLICommandReflectionProperties>,
  commandId: string
) {
  const filePath = getCommandReflectionFilePath(context, commandId);
  const serialized = reflection.serializeType();

  const message = new capnp.Message();
  const root = message.initRoot(SerializedTypes);

  convertToCapnp(serialized, root._initTypes(serialized.length));

  await writeFileBuffer(filePath, message.toArrayBuffer());
}

export async function readAllCommandsReflection(
  context: CLIPluginContext
): Promise<ReflectionRecord<CLICommandReflectionProperties>> {
  const filePath = getCommandReflectionsPath(context);
  if (!existsSync(filePath)) {
    throw new Error(`CLI Command reflection file ${filePath} not found`);
  }

  const commandFiles = await listFiles(`${filePath}/command-*.bin`);
  if (!commandFiles.length) {
    throw new Error(`No CLI Command reflection files found in ${filePath}`);
  }

  context.reflections.cli ??= {};
  for (const commandFile of commandFiles) {
    const commandId = commandFile
      .replace(new RegExp(`^${filePath}/command-`, "g"), "")
      .replace(/\.bin$/, "");
    const reflection = await readCommandReflection(context, commandId);

    context.reflections.cli[commandId] = reflection;
  }

  return context.reflections.cli;
}
