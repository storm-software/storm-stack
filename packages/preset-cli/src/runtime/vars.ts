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
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "commands",
      "vars",
      "get"
    ),
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime",
      "cli"
    )
  )}";

export interface VarsGetPayload {
  /**
   * The key to retrieve from the variables.
   */
  key: string;
}

/**
 * Retrieves a configuration parameter from the variables store.
 *
 * @param payload - The payload object containing the variable key to retrieve.
 */
async function handler(payload: StormPayload<VarsGetPayload>) {
  const varsFile = await $storm.storage.getItem(\`vars:vars.json\`);
  if (varsFile === undefined) {
    console.error(\` \${colors.red("✖")} \${colors.redBright(\`Variables file was not found\`)}\`);
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);
  if (vars?.[payload.data.key] === undefined) {
    console.error(\` \${colors.red("✖")} \${colors.redBright(\`Variable Key \\\`\${payload.data.key}\\\` not found\`)}\`);
    return;
  }

  console.log(\`\${colors.bold(\`\${payload.data.key}:\`)} \${vars[payload.data.key]}\`);
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
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "commands",
      "vars",
      "set"
    ),
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime",
      "cli"
    )
  )}";

export interface VarsSetPayload {
  /**
   * The key to set in the variables.
   */
  key: string;

  /**
   * The value to set for the key.
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
    console.error(\` \${colors.red("✖")} \${colors.redBright(\`Variables file was not found\`)}\`);
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);
  vars[payload.data.key] = payload.data.value;

  await $storm.storage.setItem(\`vars:vars.json\`, serialize(vars));

  console.log("");
  console.log(colors.dim(" > \\\`\${payload.data.key}\\\` variable set to \${payload.data.value}"));
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
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "commands",
      "vars",
      "list"
    ),
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime",
      "cli"
    )
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
    console.error(\` \${colors.red("✖")} \${colors.redBright(\`Variables file was not found\`)}\`);
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
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "commands",
      "vars",
      "delete"
    ),
    joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      context.artifactsDir,
      "runtime",
      "cli"
    )
  )}";

export interface VarsDeletePayload {
  /**
   * The key to delete from the variables.
   */
  key: string;
}

/**
 * Deletes a configuration parameter from the variables store.
 *
 * @param payload - The payload object containing the variable key to delete.
 */
async function handler(payload: StormPayload<VarsDeletePayload>) {
  const varsFile = await $storm.storage.getItem(\`vars:vars.json\`);
  if (varsFile === undefined) {
    console.error(\` \${colors.red("✖")} \${colors.redBright(\`Variables file was not found\`)}\`);
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);

  delete vars[payload.data.key];
  await $storm.storage.setItem(\`vars:vars.json\`, serialize(vars));

  console.log("");
  console.log(colors.dim(" > \\\`\${payload.data.key}\\\` variable deleted"));
  console.log("");
}

export default handler;

`;
}
