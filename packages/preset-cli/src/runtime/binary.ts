/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/helpers";
import type { Context, Options } from "@storm-stack/core/types";
import { relativePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type { StormStackCLIPresetConfig } from "../types/config";

export function writeBinary<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: Required<StormStackCLIPresetConfig>
) {
  return `#!/usr/bin/env node
${getFileHeader()}

import commands from "${joinPaths(
    relativePath(
      joinPaths(context.projectRoot, config.binaryPath),
      joinPaths(context.projectRoot, context.artifactsDir)
    )
  )}";
import { colors } from "consola/utils";
import { formatLineColumns, resolveValue } from "./_utils";
import type { ArgsDef, CommandDef } from "@storm-stack/preset-cli/types";
import { resolveArgs } from "./args";

export async function showUsage<T extends ArgsDef = ArgsDef>(
  cmd: CommandDef<T>,
  parent?: CommandDef<T>,
) {
  try {
    consola.log((await renderUsage(cmd, parent)) + "\n");
  } catch (error) {
    consola.error(error);
  }
}
  `;
}
