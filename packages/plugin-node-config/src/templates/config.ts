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

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { readConfigTypeReflection } from "@storm-stack/plugin-config/helpers/persistence";
import {
  configGet,
  configSet,
  ConfigSetupModule
} from "@storm-stack/plugin-config/templates/config";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { NodeConfigPluginContext } from "../types";

/**
 * Generates the configuration module for the Storm Stack project.
 *
 * @param context - The context for the configuration module, which includes options and runtime information.
 * @returns The generated configuration module as a string.
 */
export async function ConfigModule(
  context: NodeConfigPluginContext
): Promise<string> {
  const reflection = await readConfigTypeReflection(context);

  return `
/**
 * The Storm Stack config module provides a unified interface for managing configuration settings.
 *
 * @module storm:config
 */

${getFileHeader()}

import { env } from 'node:process';
// import { StormError } from "storm:error";
${await ConfigSetupModule(context)}

// const storageKey = \`config:${kebabCase(context.options.name)}-config_${context.meta.buildId}.json\`;

/**
 * Retrieves a configuration parameter from the configuration store.
 *
 * @remarks
 * This function retrieves a configuration parameter from the Storm Stack configuration store. It deserializes the configuration file and returns the value of the specified key.
 *
 * @param key - The name of the configuration to retrieve.
 * @returns A promise that resolves to the value of the configuration parameter.
 * @throws {StormError} If the configuration file is not found or the configuration key does not exist.
 */
// export async function getConfig<TKey extends keyof StormConfig>(
//   key: TKey
// ): Promise<StormConfig[TKey]> {
//   const configFile = await storage.getItem(storageKey);
//   if (typeof configFile === "undefined") {
//     throw new StormError(
//       "Configuration file was not found. Please ensure the Storm Stack configuration plugin is properly initialized."
//     );
//   }

//   const config = deserializeConfig(configFile);
//   return config[key];
// }

/**
 * Set a configuration parameter in the configuration store.
 *
 * @remarks
 * This function sets a configuration parameter in the Storm Stack configuration store. It serializes the updated configuration and saves it to the storage.
 *
 * @param key - The name of the configuration to set.
 * @param value - The value to set for the configuration parameter.
 */
// export async function setConfig<TKey extends keyof StormConfig>(
//   key: TKey,
//   value: StormConfig[TKey]
// ) {
//   const configFile = await storage.getItem(storageKey);
//   if (typeof configFile === "undefined") {
//     throw new StormError(
//       "Configuration file was not found. Please ensure the Storm Stack configuration plugin is properly initialized."
//     );
//   }

//   if (typeof value === "undefined") {
//     throw new StormError(
//       \`The value for the configuration parameter \${key} cannot be undefined.\`
//     );
//   }

//   const config = deserializeConfig(configFile);
//   config[key] = value;

//   await storage.setItem(storageKey, serializeConfig(config));
// }

/**
 * Delete a configuration parameter from the configuration store.
 *
 * @param key - The name of the configuration to delete.
 */
// export async function deleteConfig<TKey extends keyof StormConfig>(key: TKey) {
//   const configFile = await storage.getItem(storageKey);
//   if (typeof configFile === "undefined") {
//     throw new StormError(
//       "Configuration file was not found. Please ensure the Storm Stack configuration plugin is properly initialized."
//     );
//   }

//   const config = deserializeConfig(configFile);
//   if (typeof config[key] === "undefined") {
//     return;
//   }

//   delete config[key];
//   await storage.setItem(storageKey, serializeConfig(config));
// }

/**
 * Retrieves all configuration parameters in the configuration store.
 *
 * @returns An object containing all configuration parameters.
 */
// export async function getAllConfig(): Promise<StormConfig> {
//   const configFile = await storage.getItem(storageKey);
//   if (typeof configFile === "undefined") {
//     throw new StormError(
//       "Configuration file was not found. Please ensure the Storm Stack configuration plugin is properly initialized."
//     );
//   }

//   return deserializeConfig(configFile);
// }

// class ConfigManager {
//   constructor(buffer: SharedArrayBuffer) {
//     this.buffer = buffer;
//     this.localCount = 0;
//     this.batchSize = 100;
//   }

//   update() {
//     this.localCount++;
//     if (this.localCount >= this.batchSize) {
//         Atomics.add(this.buffer, 0, this.localCount);
//         this.localCount = 0;
//     }
//   }

//   incrementIfLessThan(maxValue) {
//     while (true) {
//       const current = Atomics.load(this.buffer, 0);

//       if (current >= maxValue) {
//           return false;
//       }

//       // Try to increment atomically
//       if (Atomics.compareExchange(
//           this.buffer,
//           0,
//           current,
//           current + 1
//       ) === current) {
//           return true;
//       }
//       // If we reach here, another thread modified the value
//       // Loop will retry the operation
//     }
//   }

//   flush() {
//     if (this.localCount > 0) {
//         Atomics.add(this.buffer, 0, this.localCount);
//         this.localCount = 0;
//     }
//   }
// }

/**
 * Initializes the Storm Stack configuration module.
 *
 * @remarks
 * This function initializes the Storm Stack configuration module by ensuring the configuration directory exists and creating a default configuration file if it does not exist.
 *
 * @param runtimeConfig - The dynamic/runtime configuration - this should include the current environment variables.
 * @returns A promise that resolves when the configuration module is initialized.
 */
export async function createConfig(runtimeConfig = env as Partial<StormConfig>): Promise<StormConfig> {
  // const persistedConfig = await storage.getItem<StormConfig>(storageKey);

  const config = deserializeConfig({
    ...initialConfig,
    // ...persistedConfig,
    ...runtimeConfig
  });

  return new Proxy<StormConfigBase>(
    config as StormConfigBase,
    {
      get: (target: StormConfigBase, propertyName: string) => {
        ${reflection
          .getProperties()
          .filter(property => !property.isIgnored())
          .sort((a, b) =>
            a.getNameAsString().localeCompare(b.getNameAsString())
          )
          .map(property =>
            configGet(context, property.getNameAsString(), property)
          )
          .join("\n else \n")}

        return undefined;
      },
      set: (target: StormConfigBase, propertyName: string, newValue: any) => {
        ${reflection
          .getProperties()
          .filter(property => !property.isIgnored() && !property.isReadonly())
          .sort((a, b) =>
            a.getNameAsString().localeCompare(b.getNameAsString())
          )
          .map(property =>
            configSet(context, property.getNameAsString(), property)
          )
          .join("\n else \n")}

        return false;
      },
    }
  ) as StormConfig;
}

   `;
}
