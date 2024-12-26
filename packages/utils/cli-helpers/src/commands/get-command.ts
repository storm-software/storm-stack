/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { detect, getCommand as getCommandBase } from "@antfu/ni";
import { CLICommandType, ResolvedCommand } from "../types";

/**
 * Get the details of a CLI command for execution
 *
 * @remarks
 * This function is a wrapper around the @antfu/ni command to run CLI commands
 *
 * @param command - The command to execute
 * @param args - The arguments to pass to the command
 * @param cwd - The current working directory to use when executing the command
 * @returns The result of the command or an exception
 */
export const getCommand = async (
  command: CLICommandType = CLICommandType.EXECUTE,
  args: string[] = [],
  cwd?: string
): Promise<ResolvedCommand> => {
  return getCommandBase(
    (await detect({
      autoInstall: true,
      cwd,
      programmatic: true
    })) ?? "npm",
    command,
    args
  );
};
