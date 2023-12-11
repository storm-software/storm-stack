/* eslint-disable @typescript-eslint/no-explicit-any */
import { StormLog } from "@storm-stack/logging";
import { stringify } from "@storm-stack/serialization";
import { isEmptyObject } from "@storm-stack/utilities";
import {
  ExecOptions,
  StdioOptions,
  execSync as extExecSync
} from "child_process";
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
        !isEmptyObject(options) ? `, options: ${stringify(options)}` : ""
      }${!isEmptyObject(env) ? `, env: ${stringify(env)}` : ""}${
        !stdio ? `, stdio: ${stdio}` : ""
      }`
    );

    return extExecSync(command, {
      encoding: "utf-8",
      env: { ...process.env, ...env },
      stdio,
      ...options
    });
  } catch (e) {
    StormLog.error(`An error occurred executing command: "${command}"`);
    StormLog.error(e);

    return (
      (e as any)?.message ?? "Exception occurred while processing request "
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
