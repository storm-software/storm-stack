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

import { getFileHeader } from "@storm-stack/core/lib";
import { CLIPluginContext } from "../types/config";

export function writeConfigGet(_context: CLIPluginContext) {
  return `${getFileHeader()}

import { deserialize } from "@storm-stack/core/deepkit/type";
import { colors } from "storm:cli";
import { StormRequest } from "storm:request";
import { StormConfig } from "storm:config";

export interface ConfigGetRequest {
  /**
   * The name of the configuration to retrieve from the configuration store.
   */
  name: string;
}

/**
 * Retrieves a configuration parameter from the configuration store.
 *
 * @param request - The request object containing the configuration name to retrieve.
 */
async function handler(request: StormRequest<ConfigGetRequest>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")}  \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);
  if (config?.[request.data.name] === undefined) {
    console.error(\` \${colors.red("✘")}  \${colors.white(\`Variable Name \\\`\${request.data.name}\\\` not found\`)}\`);
    return;
  }

  console.log(\`\${colors.bold(\`\${request.data.name}:\`)} \${config[request.data.name]}\`);
}

export default handler;

`;
}

export function writeConfigSet(_context: CLIPluginContext) {
  return `${getFileHeader()}

import { deserialize, serialize } from "@storm-stack/core/deepkit/type";
import { colors } from "storm:cli";
import { StormRequest } from "storm:request";
import { StormConfig } from "storm:config";

export interface ConfigSetRequest {
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
 * @param request - The request object containing the config key and value to set.
 */
async function handler(request: StormRequest<ConfigSetRequest>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")}  \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);
  config[request.data.name] = request.data.value;

  await $storm.storage.setItem(\`config:config.json\`, serialize<StormConfig>(config));

  console.log("");
  console.log(colors.dim(\` > \\\`\${request.data.name}\\\` configuration set to \${request.data.value}\`));
  console.log("");
}

export default handler;

`;
}

export function writeConfigList(_context: CLIPluginContext) {
  return `${getFileHeader()}

import { deserialize } from "@storm-stack/core/deepkit/type";
import { colors } from "storm:cli";
import { StormRequest } from "storm:request";
import { StormConfig } from "storm:config";

export interface ConfigListRequest {}

/**
 * Lists all configuration parameters in the configuration store.
 *
 * @param request - The request object containing the config key to retrieve.
 */
async function handler(request: StormRequest<ConfigListRequest>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")}  \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);
  console.log(\`\${Object.keys(config).map(key => \`\${colors.bold(key)}: \${config[key]}\`).join("\\n")}\`);
}

export default handler;

`;
}

export function writeConfigDelete(_context: CLIPluginContext) {
  return `${getFileHeader()}

import { deserialize, serialize } from "@storm-stack/core/deepkit/type";
import { colors } from "storm:cli";
import { StormRequest } from "storm:request";
import { StormConfig } from "storm:config";

export interface ConfigDeleteRequest {
  /**
   * The name of the configuration to delete from the configuration store.
   */
  name: string;
}

/**
 * Deletes a configuration parameter from the configuration store.
 *
 * @param request - The request object containing the configuration name to delete.
 */
async function handler(request: StormRequest<ConfigDeleteRequest>) {
  const configFile = await $storm.storage.getItem(\`config:config.json\`);
  if (configFile === undefined) {
    console.error(\` \${colors.red("✘")}  \${colors.white(\`Configuration file was not found\`)}\`);
    return;
  }

  const config = deserialize<StormConfig>(configFile);

  delete config[request.data.name];
  await $storm.storage.setItem(\`config:config.json\`, serialize<StormConfig>(config));

  console.log("");
  console.log(colors.dim(\` > \\\`\${request.data.name}\\\` configuration deleted\`));
  console.log("");
}

export default handler;

`;
}
