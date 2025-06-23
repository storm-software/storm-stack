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

import { getFileHeader } from "@storm-stack/core/helpers";
import { relativePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { StormStackCLIPresetContext } from "../types/build";

export function writeConfigGet(context: StormStackCLIPresetContext) {
  return `${getFileHeader()}

import { deserialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "get"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "get"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormConfig } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "get"),
    joinPaths(context.runtimePath, "config"),
    false
  )}";

export interface ConfigGetPayload {
  /**
   * The name of the configuration to retrieve from the configuration store.
   */
  name: string;
}

/**
 * Retrieves a configuration parameter from the configuration store.
 *
 * @param payload - The payload object containing the configuration name to retrieve.
 */
async function handler(payload: StormPayload<ConfigGetPayload>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);
  if (config?.[payload.data.name] === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Variable Name \\\`\${payload.data.name}\\\` not found\`)}\`);
    return;
  }

  console.log(\`\${colors.bold(\`\${payload.data.name}:\`)} \${config[payload.data.name]}\`);
}

export default handler;

`;
}

export function writeConfigSet(context: StormStackCLIPresetContext) {
  return `${getFileHeader()}

import { deserialize, serialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "set"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "set"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormConfig } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "set"),
    joinPaths(context.runtimePath, "config"),
    false
  )}";

export interface ConfigSetPayload {
  /**
   * The name of the configuration to set in the configuration store.
   */
  name: string;

  /**
   * The value to set for the configuration.
   */
  value: any;
}

/**
 * Sets a configuration parameter in the configuration store.
 *
 * @param payload - The payload object containing the config key and value to set.
 */
async function handler(payload: StormPayload<ConfigSetPayload>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);
  config[payload.data.name] = payload.data.value;

  await $storm.storage.setItem(\`config:config.json\`, serialize<StormConfig>(config));

  console.log("");
  console.log(colors.dim(\` > \\\`\${payload.data.name}\\\` configuration set to \${payload.data.value}\`));
  console.log("");
}

export default handler;

`;
}

export function writeConfigList(context: StormStackCLIPresetContext) {
  return `${getFileHeader()}

import { deserialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "list"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "list"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormConfig } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "list"),
    joinPaths(context.runtimePath, "config"),
    false
  )}";

export interface ConfigListPayload {}

/**
 * Lists all configuration parameters in the configuration store.
 *
 * @param payload - The payload object containing the config key to retrieve.
 */
async function handler(payload: StormPayload<ConfigListPayload>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);
  console.log(\`\${Object.keys(config).map(key => \`\${colors.bold(key)}: \${config[key]}\`).join("\\n")}\`);
}

export default handler;

`;
}

export function writeConfigDelete(context: StormStackCLIPresetContext) {
  return `${getFileHeader()}

import { deserialize, serialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "delete"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "delete"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormConfig } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "config", "delete"),
    joinPaths(context.runtimePath, "config"),
    false
  )}";

export interface ConfigDeletePayload {
  /**
   * The name of the configuration to delete from the configuration store.
   */
  name: string;
}

/**
 * Deletes a configuration parameter from the configuration store.
 *
 * @param payload - The payload object containing the configuration name to delete.
 */
async function handler(payload: StormPayload<ConfigDeletePayload>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);

  delete config[payload.data.name];
  await $storm.storage.setItem(\`config:config.json\`, serialize<StormConfig>(config));

  console.log("");
  console.log(colors.dim(\` > \\\`\${payload.data.name}\\\` configuration deleted\`));
  console.log("");
}

export default handler;

`;
}
