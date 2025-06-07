/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/helpers";
import type { Context, Options } from "@storm-stack/core/types";
import { relativePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";

export function writeVarsGet<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `${getFileHeader()}

import { deserialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "get"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "get"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormVariables } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "get"),
    joinPaths(context.runtimePath, "vars"),
    false
  )}";

export interface VarsGetPayload {
  /**
   * The name of the variable to retrieve from the variables store.
   */
  name: string;
}

/**
 * Retrieves a configuration parameter from the variables store.
 *
 * @param payload - The payload object containing the variable name to retrieve.
 */
async function handler(payload: StormPayload<VarsGetPayload>) {
  const varsFile = await $storm.storage.getItem(\`vars:vars.json\`);
  if (varsFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Variables file was not found\`)}\`);
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);
  if (vars?.[payload.data.name] === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Variable Name \\\`\${payload.data.name}\\\` not found\`)}\`);
    return;
  }

  console.log(\`\${colors.bold(\`\${payload.data.name}:\`)} \${vars[payload.data.name]}\`);
}

export default handler;

`;
}

export function writeVarsSet<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `${getFileHeader()}

import { deserialize, serialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "set"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "set"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormVariables } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "set"),
    joinPaths(context.runtimePath, "vars"),
    false
  )}";

export interface VarsSetPayload {
  /**
   * The name of the variable to set in the variables store.
   */
  name: string;

  /**
   * The value to set for the variable.
   */
  value: any;
}

/**
 * Sets a configuration parameter in the variables store.
 *
 * @param payload - The payload object containing the config key and value to set.
 */
async function handler(payload: StormPayload<VarsSetPayload>) {
  const varsFile = await $storm.storage.getItem(\`vars:vars.json\`);
  if (varsFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Variables file was not found\`)}\`);
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);
  vars[payload.data.name] = payload.data.value;

  await $storm.storage.setItem(\`vars:vars.json\`, serialize<StormVariables>(vars));

  console.log("");
  console.log(colors.dim(\` > \\\`\${payload.data.name}\\\` variable set to \${payload.data.value}\`));
  console.log("");
}

export default handler;

`;
}

export function writeVarsList<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `${getFileHeader()}

import { deserialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "list"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "list"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormVariables } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "list"),
    joinPaths(context.runtimePath, "vars"),
    false
  )}";

export interface VarsListPayload {}

/**
 * Lists all configuration parameters in the variables store.
 *
 * @param payload - The payload object containing the config key to retrieve.
 */
async function handler(payload: StormPayload<VarsListPayload>) {
  const varsFile = await $storm.storage.getItem(\`vars:vars.json\`);
  if (varsFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Variables file was not found\`)}\`);
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);
  console.log(\`\${Object.keys(vars).map(key => \`\${colors.bold(key)}: \${vars[key]}\`).join("\\n")}\`);
}

export default handler;

`;
}

export function writeVarsDelete<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `${getFileHeader()}

import { deserialize, serialize } from "@deepkit/type";
import { colors } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "delete"),
    joinPaths(context.runtimePath, "cli"),
    false
  )}";
import { StormPayload } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "delete"),
    joinPaths(context.runtimePath, "payload"),
    false
  )}";
import { StormVariables } from "${relativePath(
    joinPaths(context.artifactsPath, "commands", "vars", "delete"),
    joinPaths(context.runtimePath, "vars"),
    false
  )}";

export interface VarsDeletePayload {
  /**
   * The name of the variable to delete from the variables store.
   */
  name: string;
}

/**
 * Deletes a configuration parameter from the variables store.
 *
 * @param payload - The payload object containing the variable name to delete.
 */
async function handler(payload: StormPayload<VarsDeletePayload>) {
  const varsFile = await $storm.storage.getItem(\`vars:vars.json\`);
  if (varsFile === undefined) {
    console.error(\` \${colors.red("✘")} \${colors.white(\`Variables file was not found\`)}\`);
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);

  delete vars[payload.data.name];
  await $storm.storage.setItem(\`vars:vars.json\`, serialize<StormVariables>(vars));

  console.log("");
  console.log(colors.dim(\` > \\\`\${payload.data.name}\\\` variable deleted\`));
  console.log("");
}

export default handler;

`;
}
