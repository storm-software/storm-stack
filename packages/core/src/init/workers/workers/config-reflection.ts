#!/usr/bin/env -S NODE_OPTIONS=--enable-source-maps node
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
  ReflectionKind,
  resolveClassType,
  SerializedTypes
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import * as capnp from "@stryke/capnp";
import { readBufferFile, writeBufferFile } from "@stryke/fs/buffer";
import { removeFile } from "@stryke/fs/remove-file";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "node:fs";
import { SerializedTypes as CapnpSerializedTypes } from "../../../../schemas/reflection";
import {
  convertFromCapnp,
  convertToCapnp
} from "../../../helpers/utilities/capnp";
import { createLog } from "../../../helpers/utilities/logger";

const log = createLog("worker:config-reflection");

/**
 * Interface representing the data required to commit variables.
 */
export interface AddPayload {
  /**
   * The variables to commit.
   */
  config: SerializedTypes;

  /**
   * The file path where the variables should be committed.
   */
  path: string;
}

/**
 * Add the variable to the specified file path.
 *
 * @param payload - The data containing variables and file path.
 * @returns A promise that resolves when the commit is complete.
 */
export async function add(payload: AddPayload): Promise<void> {
  if (!payload.path) {
    throw new Error(
      "The variables reflection file path is required to run the commit-vars worker."
    );
  }

  log(LogLevelLabel.TRACE, StormJSON.stringify(payload.config));

  let configReflection: ReflectionClass<unknown> = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the dotenv variables used by the application.`,
    types: []
  });

  if (existsSync(payload.path)) {
    log(
      LogLevelLabel.TRACE,
      `Config reflection file found at ${payload.path}, reading existing reflection.`
    );

    configReflection = resolveClassType(
      deserializeType(
        convertFromCapnp(
          new capnp.Message(await readBufferFile(payload.path), false).getRoot(
            CapnpSerializedTypes
          ).types
        )
      )
    );
  }

  log(
    LogLevelLabel.TRACE,
    `Adding new variables to config reflection at ${payload.path}.`
  );

  ReflectionClass.from(deserializeType(payload.config))
    .getProperties()
    .filter(property => !configReflection.hasProperty(property.name))
    .forEach(property => {
      configReflection.addProperty({
        ...property,
        name: property.getName(),
        description:
          property.getDescription() ?? `The ${property.name} variable.`,
        default: property.getDefaultValue(),
        optional: property.isOptional() ? true : undefined,
        readonly: property.isReadonly() ? true : undefined,
        visibility: property.getVisibility(),
        type: property.getType(),
        tags: property.getTags()
      } as Parameters<typeof configReflection.addProperty>[0]);
    });

  const serialized = configReflection.serializeType();

  const message = new capnp.Message();
  const root = message.initRoot(CapnpSerializedTypes);

  convertToCapnp(serialized, root._initTypes(serialized.length));

  await removeFile(payload.path);
  await writeBufferFile(payload.path, message.toArrayBuffer());

  // const types = root._initTypes(4);
  // types.set(0, "config");
  // types.set(1, "secrets");
  // types.set(2, "configReflection");
  // types.set(3, "secretsReflection");
  // await writeBufferFile(data.dataPath, message.toArrayBuffer());
}

/**
 * Interface representing the data required to commit variables.
 */
export interface ClearPayload {
  /**
   * The file path where the variables should be committed.
   */
  path: string;
}

/**
 * Add the variable to the specified file path.
 *
 * @param payload - The data containing variables and file path.
 * @returns A promise that resolves when the commit is complete.
 */
export async function clear(payload: ClearPayload): Promise<void> {
  if (!payload.path) {
    throw new Error(
      "The variables reflection file path is required to run the commit-vars worker."
    );
  }

  if (existsSync(payload.path)) {
    await removeFile(payload.path);
  }
}
