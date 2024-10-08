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

import { StormLog } from "@storm-stack/logging";
import { StormParser } from "@storm-stack/serialization";
import { isEmptyObject } from "@storm-stack/types";
import {
  ExecOptions,
  StdioOptions,
  execSync as extExecSync
} from "node:child_process";
import { Readable } from "node:stream";
import { promisify } from "node:util";

/**
 * Execute a command.
 *
 * @param command - The command to execute
 * @param options - The options to use when executing the command
 * @param env - The environment variables to use when executing the command
 * @param stdio - The stdio options to use when executing the command
 * @returns The result of the command
 */
export const execute = (
  command: string,
  options: ExecOptions = {},
  env: Record<string, string> = {},
  stdio: StdioOptions = "inherit"
): string | Buffer | Readable | undefined => {
  try {
    StormLog.info(
      `Executing command: "${command}"${
        isEmptyObject(options)
          ? ""
          : `, options: ${StormParser.stringify(options)}`
      }${isEmptyObject(env) ? "" : `, env: ${StormParser.stringify(env)}`}${
        stdio ? "" : `, stdio: ${stdio}`
      }`
    );

    return extExecSync(command, {
      encoding: "utf8",
      env: { ...process.env, ...env },
      stdio,
      ...options
    });
  } catch (error_) {
    StormLog.error(`An error occurred executing command: "${command}"`);
    StormLog.error(error_);

    return (
      (error_ as any)?.message ?? "Exception occurred while processing request "
    );
  }
};

/**
 * Execute a command asynchronously.
 *
 * @param command - The command to execute
 * @param options - The options to use when executing the command
 * @param env - The environment variables to use when executing the command
 * @param stdio - The stdio options to use when executing the command
 * @returns The result of the command
 */
export const executeAsync = async (
  command: string,
  options?: ExecOptions,
  env?: Record<string, string>,
  stdio?: StdioOptions
): Promise<string | Buffer | undefined> => {
  return (await promisify(execute)(command, options, env, stdio)) as any;
};
