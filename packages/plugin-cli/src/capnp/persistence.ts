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

import * as capnp from "@stryke/capnp";
import { joinPaths } from "@stryke/path/join-paths";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { CommandRoot } from "../../schemas/cli";
import { StormStackCLIPluginContext } from "../types/build";
import { CLIPluginOptions } from "../types/config";
import { CommandTree } from "../types/reflection";
import { convertFromCapnp, convertToCapnp } from "./capnp";

export function getCommandTreeReflectionPath(
  context: StormStackCLIPluginContext
): string {
  return joinPaths(context.dataPath, "reflections", "cli.bin");
}

export async function writeCommandTreeReflection(
  context: StormStackCLIPluginContext,
  commandTree: CommandTree
) {
  const message = new capnp.Message();
  const root = message.initRoot(CommandRoot);

  convertToCapnp(commandTree, root);
  await context.vfs.writeFile(
    getCommandTreeReflectionPath(context),
    Buffer.from(message.toArrayBuffer()),
    {
      encoding: "binary",
      outputMode: "fs"
    }
  );
}

export async function readCommandTreeReflection(
  context: StormStackCLIPluginContext,
  config: CLIPluginOptions
): Promise<CommandTree> {
  const result = await readFile(getCommandTreeReflectionPath(context));
  const buffer = result.buffer.slice(
    result.byteOffset,
    result.byteOffset + result.byteLength
  ) as ArrayBuffer;

  const message = new capnp.Message(buffer, false);

  return convertFromCapnp(context, config, message.getRoot(CommandRoot));
}
