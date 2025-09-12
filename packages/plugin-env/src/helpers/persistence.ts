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
import { EnvPluginContext, EnvType } from "../types/plugin";
import { createEnvReflection } from "./reflect";

/**
 * Gets the default type definition for the environment variables.
 *
 * @param context - The plugin context.
 * @returns The default type definition for the environment variables.
 */
export function getEnvDefaultTypeDefinition(
  context: EnvPluginContext
): TypeDefinition {
  return {
    file: process.env.STORM_STACK_LOCAL
      ? joinPaths(
          context.options.workspaceConfig.workspaceRoot,
          "dist/packages/types/dist/esm/src/shared/env.js"
        )
      : "@storm-stack/core/runtime-types/shared/env",
    name: "__ΩStormEnvInterface"
  };
}

/** Gets the default type definition for the environment secrets.
 *
 * @param context - The plugin context.
 * @returns The default type definition for the environment secrets.
 */
export function getSecretsDefaultTypeDefinition(
  context: EnvPluginContext
): TypeDefinition {
  return {
    file: process.env.STORM_STACK_LOCAL
      ? joinPaths(
          context.options.workspaceConfig.workspaceRoot,
          "dist/packages/types/dist/esm/src/shared/env.js"
        )
      : "@storm-stack/core/runtime-types/shared/env",
    name: "__ΩStormSecretsInterface"
  };
}

/**
 * Gets the path to the environment type reflections.
 *
 * @param context - The plugin context.
 * @param name - The name of the type reflections.
 * @returns The path to the environment type reflections.
 */
export function getEnvTypeReflectionsPath(
  context: EnvPluginContext,
  name: EnvType = "env"
): string {
  return joinPaths(getReflectionsPath(context), "env", `${name}-types.bin`);
}

/**
 * Reads the environment type reflection from the file system.
 *
 * @param context - The plugin context.
 * @param name - The name of the type reflections.
 * @returns The environment type reflection.
 */
export async function readEnvTypeReflection(
  context: EnvPluginContext,
  name: EnvType = "env"
): Promise<ReflectionClass<any>> {
  const filePath = getEnvTypeReflectionsPath(context, name);
  if (!existsSync(filePath)) {
    if (
      !context.reflections.env.types.env ||
      isEmptyObject(context.reflections.env.types.env)
    ) {
      const reflection = createEnvReflection(context) as Reflection;

      const message = new capnp.Message();
      reflection.messageRoot = message.initRoot(SerializedTypes);
      reflection.dataBuffer = message.toArrayBuffer();

      context.reflections.env.types.env = reflection;

      await writeEnvTypeReflection(
        context,
        context.reflections.env.types.env,
        name
      );
    }
    return context.reflections.env.types.env;
  }

  const buffer = await readFileBuffer(filePath);
  const message = new capnp.Message(buffer, false);
  const messageRoot = message.getRoot(SerializedTypes);

  const reflection = resolveClassType(
    deserializeType(convertFromCapnp(messageRoot.types))
  );

  context.reflections.env.types[name] = reflection;
  context.reflections.env.types[name].messageRoot = messageRoot;
  context.reflections.env.types[name].dataBuffer = buffer;

  return reflection;
}

/**
 * Writes the environment type reflection to the file system.
 *
 * @param context - The plugin context.
 * @param reflection - The environment type reflection to write.
 * @param name - The name of the type reflections.
 */
export async function writeEnvTypeReflection(
  context: EnvPluginContext,
  reflection: ReflectionClass<any>,
  name: EnvType = "env"
) {
  const serialized = reflection.serializeType();

  const message = new capnp.Message();
  const root = message.initRoot(SerializedTypes);

  convertToCapnp(serialized, root._initTypes(serialized.length));

  await context.vfs.writeFile(
    getEnvTypeReflectionsPath(context, name),
    Buffer.from(message.toArrayBuffer()),
    {
      encoding: "binary",
      outputMode: "fs"
    }
  );
}

export function getEnvReflectionsPath(
  context: EnvPluginContext,
  name: EnvType
): string {
  return joinPaths(getReflectionsPath(context), "env", `${name}.bin`);
}

/**
 * Reads the environment reflection data from the file system.
 *
 * @param context - The plugin context.
 * @returns The environment reflection data.
 */
export async function readEnvReflection(
  context: EnvPluginContext
): Promise<ReflectionClass<any>> {
  const filePath = getEnvReflectionsPath(context, "env");
  if (!existsSync(filePath)) {
    if (!context.reflections.env.types.env) {
      context.reflections.env.types.env = await readEnvTypeReflection(
        context,
        "env"
      );
    }

    if (
      !context.reflections.env.env ||
      isEmptyObject(context.reflections.env.env)
    ) {
      const reflection = createEnvReflection(context, {
        type: {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormEnv",
          description: `An object containing the environment configuration parameters that are used (at least once) by the ${
            context.options.name
              ? `${context.options.name} application`
              : "application"
          }.`,
          types: []
        },
        superReflection: context.reflections.env.types.env
      }) as Reflection;
      reflection.name = "StormEnv";

      const message = new capnp.Message();
      reflection.messageRoot = message.initRoot(SerializedTypes);
      reflection.dataBuffer = message.toArrayBuffer();

      context.reflections.env.env = reflection;
      await writeEnvReflection(context, context.reflections.env.env, "env");
    }

    return context.reflections.env.env;
  }

  const buffer = await readFileBuffer(filePath);
  const message = new capnp.Message(buffer, false);
  const messageRoot = message.getRoot(SerializedTypes);

  const reflection = resolveClassType(
    deserializeType(convertFromCapnp(messageRoot.types))
  );

  context.reflections.env.env = reflection;
  context.reflections.env.env.messageRoot = messageRoot;
  context.reflections.env.env.dataBuffer = buffer;

  return reflection;
}

/**
 * Reads the secret environment reflection data from the file system.
 *
 * @param context - The plugin context.
 * @returns The environment reflection data.
 */
export async function readSecretsReflection(
  context: EnvPluginContext
): Promise<ReflectionClass<any>> {
  const filePath = getEnvReflectionsPath(context, "secrets");
  if (!existsSync(filePath)) {
    if (!context.reflections.env.types.secrets) {
      context.reflections.env.types.secrets = await readEnvTypeReflection(
        context,
        "secrets"
      );
    }

    if (
      !context.reflections.env.secrets ||
      isEmptyObject(context.reflections.env.secrets)
    ) {
      const reflection = createEnvReflection(context, {
        type: {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormSecrets",
          description: `An object containing the secret configuration parameters that are used (at least once) by the ${
            context.options.name
              ? `${context.options.name} application`
              : "application"
          }.`,
          types: []
        },
        superReflection: context.reflections.env.types.secrets
      }) as Reflection;
      reflection.name = "StormSecrets";

      const message = new capnp.Message();
      reflection.messageRoot = message.initRoot(SerializedTypes);
      reflection.dataBuffer = message.toArrayBuffer();

      context.reflections.env.secrets = reflection;
      await writeEnvReflection(
        context,
        context.reflections.env.secrets,
        "secrets"
      );
    }

    return context.reflections.env.secrets;
  }

  const buffer = await readFileBuffer(filePath);
  const message = new capnp.Message(buffer, false);
  const messageRoot = message.getRoot(SerializedTypes);

  const reflection = resolveClassType(
    deserializeType(convertFromCapnp(messageRoot.types))
  );

  context.reflections.env.secrets = reflection;
  context.reflections.env.secrets.messageRoot = messageRoot;
  context.reflections.env.secrets.dataBuffer = buffer;

  return reflection;
}

/**
 * Writes the environment reflection data to the file system.
 *
 * @param context - The plugin context.
 * @param reflection - The reflection data to write.
 * @param name - The name of the reflection (either "env" or "secrets").
 */
export async function writeEnvReflection(
  context: EnvPluginContext,
  reflection: ReflectionClass<any>,
  name: EnvType = "env"
) {
  const serialized = reflection.serializeType();

  const message = new capnp.Message();
  const root = message.initRoot(SerializedTypes);

  convertToCapnp(serialized, root._initTypes(serialized.length));

  await context.vfs.writeFile(
    getEnvReflectionsPath(context, name),
    Buffer.from(message.toArrayBuffer()),
    {
      encoding: "binary",
      outputMode: "fs"
    }
  );
}
