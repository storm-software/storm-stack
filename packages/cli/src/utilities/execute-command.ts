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

import { detect, getCommand } from "@antfu/ni";
import { CLICommandType } from "../types";
import { execute } from "./execute";

/**
 * Execute a CLI command
 *
 * @remarks
 * This function is a wrapper around the execa command to run CLI commands
 *
 * @param command - The command to execute
 * @param args - The arguments to pass to the command
 * @param cwd - The current working directory to use when executing the command
 * @returns The result of the command or an exception
 */
export const executeCommand = async (
  command: CLICommandType = CLICommandType.EXECUTE,
  args?: string[],
  cwd: string = "./"
) => {
  const result = getCommand(
    (await detect({
      autoInstall: true,
      cwd,
      programmatic: true
    })) ?? "npm",
    command,
    args
  );

  return execute(`${result.command} ${result.args.join(" ")}`, cwd);
};
