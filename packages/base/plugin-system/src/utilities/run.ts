import { detect, getCommand } from "@antfu/ni";
import { type ExecaReturnValue, execaCommand } from "execa";

// wrapper around execa to run our command line processes
export const execute = (
  command: string,
  rootPath: string
): Promise<ExecaReturnValue<string>> => {
  return execaCommand(command, {
    preferLocal: true,
    shell: true,
    stdio: "inherit",
    cwd: rootPath
  });
};

export const install = async (name: string, rootPath: string) => {
  await execute(
    getCommand(
      (await detect({
        autoInstall: false,
        cwd: rootPath,
        programmatic: true
      })) ?? "npm",
      "install",
      [name]
    ),
    rootPath
  );
};
