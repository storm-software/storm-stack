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

import { execaCommand } from "execa";

/**
 * Execute a CLI command
 *
 * @remarks
 * This function is a wrapper around the execa command to run CLI commands
 *
 * @param command - The command to execute
 * @param cwd - The current working directory to use when executing the command
 * @returns The result of the command or an exception
 */
export const execute = (command: string, cwd: string) => {
  return execaCommand(command, {
    preferLocal: true,
    shell: true,
    stdio: "inherit",
    cwd
  });
};
