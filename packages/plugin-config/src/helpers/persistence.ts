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
  ReflectionKind,
  resolveClassType
} from "@storm-stack/core/deepkit/type";
import { convertFromCapnp, convertToCapnp } from "@storm-stack/core/lib/capnp";
import { getReflectionsPath } from "@storm-stack/core/lib/deepkit/resolve-reflections";
import { SerializedTypes } from "@storm-stack/core/schemas/reflection";
import { Reflection } from "@storm-stack/core/types/context";
import * as capnp from "@stryke/capnp";
import { readFileBuffer } from "@stryke/fs/buffer";
import { joinPaths } from "@stryke/path/join-paths";
import { isEmptyObject } from "@stryke/type-checks/is-empty-object";
import type { TypeDefinition } from "@stryke/types/configuration";
import { Buffer } from "node:buffer";
import { existsSync } from "node:fs";
import { ConfigPluginContext } from "../types/plugin";
import { createConfigParamsReflection } from "./reflect";

export function getConfigDefaultTypeDefinition(
  context: ConfigPluginContext
): TypeDefinition {
  return {
    file: process.env.STORM_STACK_LOCAL
      ? joinPaths(
          context.options.workspaceConfig.workspaceRoot,
          "dist/packages/types/dist/esm/src/shared/config.js"
        )
      : "@storm-stack/types/shared/config",
    name: "__ΩStormConfigInterface"
  };
}

export function getConfigTypeReflectionsPath(
  context: ConfigPluginContext,
  name: "params" | "secrets" = "params"
): string {
  return joinPaths(getReflectionsPath(context), "config", `${name}-types.bin`);
}

export async function readConfigTypeReflection(
  context: ConfigPluginContext,
  name: "params" | "secrets" = "params"
): Promise<ReflectionClass<any>> {
  const filePath = getConfigTypeReflectionsPath(context, name);
  if (!existsSync(filePath)) {
    if (
      !context.reflections.config.types.params ||
      isEmptyObject(context.reflections.config.types.params)
    ) {
      const reflection = createConfigParamsReflection(context) as Reflection;

      const message = new capnp.Message();
      reflection.messageRoot = message.initRoot(SerializedTypes);
      reflection.dataBuffer = message.toArrayBuffer();

      context.reflections.config.types.params = reflection;

      await writeConfigTypeReflection(
        context,
        context.reflections.config.types.params,
        "params"
      );
    }
    return context.reflections.config.types.params;
  }

  const buffer = await readFileBuffer(filePath);
  const message = new capnp.Message(buffer, false);
  const messageRoot = message.getRoot(SerializedTypes);

  const reflection = resolveClassType(
    deserializeType(convertFromCapnp(messageRoot.types))
  );

  context.reflections[name] = reflection;
  context.reflections[name].messageRoot = messageRoot;
  context.reflections[name].dataBuffer = buffer;

  return reflection;
}

export async function writeConfigTypeReflection(
  context: ConfigPluginContext,
  reflection: ReflectionClass<any>,
  name: "params" | "secrets" = "params"
) {
  const serialized = reflection.serializeType();

  const message = new capnp.Message();
  const root = message.initRoot(SerializedTypes);

  convertToCapnp(serialized, root._initTypes(serialized.length));

  await context.vfs.writeFile(
    getConfigTypeReflectionsPath(context, name),
    Buffer.from(message.toArrayBuffer()),
    {
      encoding: "binary",
      outputMode: "fs"
    }
  );
}

export function getConfigReflectionsPath(
  context: ConfigPluginContext,
  name: "params" | "secrets"
): string {
  return joinPaths(getReflectionsPath(context), "config", `${name}.bin`);
}

export async function readConfigReflection(
  context: ConfigPluginContext,
  name: "params" | "secrets" = "params"
): Promise<ReflectionClass<any>> {
  const filePath = getConfigReflectionsPath(context, name);
  if (!existsSync(filePath)) {
    if (!context.reflections.config.types.params) {
      context.reflections.config.types.params = await readConfigTypeReflection(
        context,
        name
      );
    }

    if (
      !context.reflections.config.params ||
      isEmptyObject(context.reflections.config.params)
    ) {
      const reflection = createConfigParamsReflection(context, {
        type: {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormConfig",
          description: `An object containing the configuration parameters that are used (at least once) by the ${
            context.options.name
              ? `${context.options.name} application`
              : "application"
          }.`,
          types: []
        },
        superReflection: context.reflections.config.types.params
      }) as Reflection;
      reflection.name = "StormConfig";

      const message = new capnp.Message();
      reflection.messageRoot = message.initRoot(SerializedTypes);
      reflection.dataBuffer = message.toArrayBuffer();

      context.reflections.config.params = reflection;
      await writeConfigReflection(
        context,
        context.reflections.config.params,
        "params"
      );
    }

    return context.reflections.config.params;
  }

  const buffer = await readFileBuffer(filePath);
  const message = new capnp.Message(buffer, false);
  const messageRoot = message.getRoot(SerializedTypes);

  const reflection = resolveClassType(
    deserializeType(convertFromCapnp(messageRoot.types))
  );

  context.reflections[name] = reflection;
  context.reflections[name].messageRoot = messageRoot;
  context.reflections[name].dataBuffer = buffer;

  return reflection;
}

export async function writeConfigReflection(
  context: ConfigPluginContext,
  reflection: ReflectionClass<any>,
  name: "params" | "secrets" = "params"
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
