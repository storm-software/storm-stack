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

import * as capnp from "@stryke/capnp";
import { readBufferFile, writeBufferFile } from "@stryke/fs/buffer";
import { joinPaths } from "@stryke/path/join-paths";
import { CommandRoot } from "../../schemas/cli";
import { StormStackCLIPresetContext } from "../types/build";
import { StormStackCLIPresetConfig } from "../types/config";
import { CommandTree } from "../types/reflection";
import { convertFromCapnp, convertToCapnp } from "./capnp";

export function getCommandTreeReflectionPath(
  context: StormStackCLIPresetContext
): string {
  return joinPaths(context.dataPath, "reflections", "cli.bin");
}

export async function writeCommandTreeReflection(
  context: StormStackCLIPresetContext,
  commandTree: CommandTree
) {
  const message = new capnp.Message();
  const root = message.initRoot(CommandRoot);

  convertToCapnp(commandTree, root);
  await writeBufferFile(
    getCommandTreeReflectionPath(context),
    message.toArrayBuffer()
  );
}

export async function readCommandTreeReflection(
  context: StormStackCLIPresetContext,
  config: StormStackCLIPresetConfig
): Promise<CommandTree> {
  const buffer = await readBufferFile(getCommandTreeReflectionPath(context));
  const message = new capnp.Message(buffer, false);

  return convertFromCapnp(context, config, message.getRoot(CommandRoot));
}
